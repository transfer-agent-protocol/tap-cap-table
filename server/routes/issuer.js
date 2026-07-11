import { Router } from "express";
import { v4 as uuid } from "uuid";

import issuerSchema from "../../ocf/schema/objects/Issuer.schema.json" with { type: "json" };
import deployCapTable from "../chain-operations/deployCapTable.js";
import { createIssuer } from "../db/operations/create.js";
import { countIssuers, readIssuerById } from "../db/operations/read.js";
import { find } from "../db/operations/atomic.ts";
import Issuer from "../db/objects/Issuer.js";
import Stakeholder from "../db/objects/Stakeholder.js";
import StockClass from "../db/objects/StockClass.js";
import { StockIssuance } from "../db/objects/transactions/issuance/index.js";
import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

const issuer = Router();

issuer.get("/", async (req, res) => {
    res.send(`Hello issuer!`);
});

//WIP get routes are currently fetching offchain.
issuer.get("/id/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { issuerId, type, role } = await readIssuerById(id);

        res.status(200).send({ issuerId, type, role });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

issuer.get("/total-number", async (req, res) => {
    try {
        const totalIssuers = await countIssuers();
        res.status(200).send(totalIssuers);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

issuer.post("/create", async (req, res) => {
    try {
        // OCF doesn't allow extra fields in their validation
        const incomingIssuerToValidate = {
            id: uuid(),
            object_type: "ISSUER",
            ...req.body,
        };

        console.log("⏳ | Issuer to validate", incomingIssuerToValidate);

        await validateInputAgainstOCF(incomingIssuerToValidate, issuerSchema);

        const issuerIdBytes16 = convertUUIDToBytes16(incomingIssuerToValidate.id);
        console.log("💾 | Issuer id in bytes16 ", issuerIdBytes16);
        const { address, deployHash } = await deployCapTable(
            issuerIdBytes16,
            incomingIssuerToValidate.legal_name,
            incomingIssuerToValidate.initial_shares_authorized
        );

        const incomingIssuerForDB = {
            ...incomingIssuerToValidate,
            deployed_to: address,
            tx_hash: deployHash,
        };

        const issuer = await createIssuer(incomingIssuerForDB);

        console.log("✅ | Issuer created offchain:", issuer);

        res.status(200).send({ issuer });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

// Register an externally-deployed cap table (e.g. from the frontend wallet flow)
issuer.post("/register", async (req, res) => {
    try {
        const { id: bytes16Id, deployed_to, tx_hash, deployed_by, ...ocfFields } = req.body;

        if (!deployed_to || !tx_hash) {
            return res.status(400).send("deployed_to and tx_hash are required");
        }

        // Use the same ID that was sent to the contract (bytes16 → UUID)
        // so the event poller can match the IssuerCreated event to this DB record.
        // Falls back to a random UUID for backwards compatibility.
        const issuerId = bytes16Id ? convertBytes16ToUUID(bytes16Id) : uuid();

        const incomingIssuerToValidate = {
            id: issuerId,
            object_type: "ISSUER",
            ...ocfFields,
        };

        console.log("⏳ | Issuer to validate (register)", incomingIssuerToValidate);

        await validateInputAgainstOCF(incomingIssuerToValidate, issuerSchema);

        const incomingIssuerForDB = {
            ...incomingIssuerToValidate,
            deployed_to,
            tx_hash,
            ...(deployed_by && { deployed_by }),
        };

        const issuerRecord = await createIssuer(incomingIssuerForDB);

        console.log("✅ | Issuer registered offchain:", issuerRecord);

        res.status(200).send({ issuer: issuerRecord });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

// GET full issuer document (the actual OCF + deployed_to etc. saved at mint/register time).
// Used by the /manage/cap-table page to hydrate the full issuer record from a URL ?issuerId=.
issuer.get("/full/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const issuerDoc = await readIssuerById(id);
        if (!issuerDoc) {
            return res.status(404).send("Issuer not found");
        }
        res.status(200).send(issuerDoc);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

// List all issuers deployed by a given admin wallet address (the ones this UI cares about)
issuer.get("/by-deployer/:address", async (req, res) => {
    try {
        const addr = req.params.address;
        if (!addr) return res.status(400).send("address required");
        // Match case-insensitively on the stored address
        const issuers = await find(Issuer, { deployed_by: new RegExp(`^${addr}$`, "i") });
        res.status(200).send({ issuers, count: issuers.length });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

/**
 * Lightweight Mongo stats for manage list cards.
 * POST body: { ids: string[] }
 * Does not hit RPC — issuances approximate "has positions".
 */
issuer.post("/summaries", async (req, res) => {
    try {
        const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];
        if (ids.length === 0) return res.status(200).json({ summaries: {} });

        const summaries = {};
        await Promise.all(
            ids.map(async (id) => {
                const [people, peopleOnchain, classes, classesOnchain, issuances] = await Promise.all([
                    Stakeholder.countDocuments({ issuer: id }),
                    Stakeholder.countDocuments({ issuer: id, is_onchain_synced: true }),
                    StockClass.countDocuments({ issuer: id }),
                    StockClass.countDocuments({ issuer: id, is_onchain_synced: true }),
                    StockIssuance.countDocuments({ issuer: id }),
                ]);
                summaries[id] = {
                    people,
                    peopleOnchain,
                    classes,
                    classesOnchain,
                    classesGhost: Math.max(0, classes - classesOnchain),
                    issuances,
                    readyToIssue: peopleOnchain > 0 && classesOnchain > 0,
                    hasPositions: issuances > 0,
                };
            })
        );
        res.status(200).json({ summaries });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error?.message || error) });
    }
});

const isZeroBytes16 = (value) => {
    if (value == null) return true;
    const s = String(value);
    // ethers may return 0x00… or empty
    return s === "" || s === "0x" || /^0x0+$/i.test(s) || s === "0";
};

/**
 * Reconcile Mongo is_onchain_synced flags against the live cap table contract.
 * Fixes permanent "ghost" metadata rows when the poller missed StockClassCreated /
 * StakeholderCreated (race, head-jump, etc.). Does NOT invent positions — chain is SoT.
 *
 * POST body: { issuerId }
 */
issuer.post("/reconcile", async (req, res) => {
    try {
        const id = req.body?.issuerId || req.body?.id;
        if (!id) return res.status(400).json({ error: "issuerId required" });

        const issuerDoc = await Issuer.findById(id);
        if (!issuerDoc) return res.status(404).json({ error: "Issuer not found" });
        if (!issuerDoc.deployed_to) {
            // Soft success: UI can still show Mongo people/classes; nothing to check on chain
            return res.status(200).json({
                issuerId: id,
                fixedClasses: [],
                stillGhostClasses: [],
                fixedPeople: [],
                stillGhostPeople: [],
                peopleOnchain: await Stakeholder.countDocuments({ issuer: id, is_onchain_synced: true }),
                classesOnchain: await StockClass.countDocuments({ issuer: id, is_onchain_synced: true }),
                issuances: await StockIssuance.countDocuments({ issuer: id }),
                txHashesBackfilled: 0,
                txHashesStillMissing: 0,
                message: "Company has no contract address yet — nothing to reconcile on chain.",
            });
        }

        const { getIssuerContract } = await import("../utils/caches.ts");
        const { updateStockClassById, updateStakeholderById } = await import("../db/operations/update.js");

        const { contract } = await getIssuerContract(issuerDoc);

        const ghostClasses = await StockClass.find({ issuer: id, is_onchain_synced: { $ne: true } });
        const ghostPeople = await Stakeholder.find({ issuer: id, is_onchain_synced: { $ne: true } });

        const fixedClasses = [];
        const stillGhostClasses = [];
        for (const sc of ghostClasses) {
            try {
                const [onchainId] = await contract.getStockClassById(convertUUIDToBytes16(sc._id));
                if (!isZeroBytes16(onchainId)) {
                    await updateStockClassById(sc._id, { is_onchain_synced: true });
                    fixedClasses.push(sc._id);
                } else {
                    stillGhostClasses.push(sc._id);
                }
            } catch (e) {
                console.warn(`reconcile class ${sc._id}:`, e?.message || e);
                stillGhostClasses.push(sc._id);
            }
        }

        const fixedPeople = [];
        const stillGhostPeople = [];
        for (const sh of ghostPeople) {
            try {
                const [onchainId] = await contract.getStakeholderById(convertUUIDToBytes16(sh._id));
                if (!isZeroBytes16(onchainId)) {
                    await updateStakeholderById(sh._id, { is_onchain_synced: true });
                    fixedPeople.push(sh._id);
                } else {
                    stillGhostPeople.push(sh._id);
                }
            } catch (e) {
                console.warn(`reconcile stakeholder ${sh._id}:`, e?.message || e);
                stillGhostPeople.push(sh._id);
            }
        }

        const [peopleOnchain, classesOnchain, issuances] = await Promise.all([
            Stakeholder.countDocuments({ issuer: id, is_onchain_synced: true }),
            StockClass.countDocuments({ issuer: id, is_onchain_synced: true }),
            StockIssuance.countDocuments({ issuer: id }),
        ]);

        // Fill missing Activity TX hashes from onchain TxCreated logs (legacy rows never stored them)
        const { backfillTxHashesForIssuer } = await import("../chain-operations/backfillTxHashes.js");
        const hashBackfill = await backfillTxHashesForIssuer(issuerDoc);

        const parts = [];
        if (fixedClasses.length || fixedPeople.length) {
            parts.push(
                `Reconciled ${fixedClasses.length} class(es) and ${fixedPeople.length} person/people from chain.`
            );
        } else if (stillGhostClasses.length || stillGhostPeople.length) {
            parts.push(
                `Checked chain: ${stillGhostClasses.length} class(es) and ${stillGhostPeople.length} person/people are still not onchain (recreate via wallet).`
            );
        } else {
            parts.push("Flags match the chain.");
        }
        if (hashBackfill.updated > 0 || hashBackfill.stillMissing > 0 || hashBackfill.message) {
            parts.push(hashBackfill.message);
        }

        res.status(200).json({
            issuerId: id,
            fixedClasses,
            stillGhostClasses,
            fixedPeople,
            stillGhostPeople,
            peopleOnchain,
            classesOnchain,
            issuances,
            txHashesBackfilled: hashBackfill.updated,
            txHashesStillMissing: hashBackfill.stillMissing,
            message: parts.join(" "),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error?.message || error) });
    }
});

/**
 * Adjust the event poller cursor for one issuer.
 *
 * POST body:
 *   { issuerId, mode: "reindex" | "head", buffer? }
 *
 * - reindex (default, safe recovery): set last_processed_block to deploy receipt − 1
 *   so the poller re-walks all contract events. Historical rows are idempotent.
 * - head: jump to chain head (SKIPS gap). Only for unsticking when backlog is
 *   intentionally abandoned — never use as "fix my data".
 */
issuer.post("/poller-catchup", async (req, res) => {
    try {
        const id = req.body?.issuerId || req.body?.id;
        if (!id) return res.status(400).json({ error: "issuerId required" });

        const mode = (req.body?.mode || "reindex").toString().toLowerCase();
        if (mode !== "reindex" && mode !== "head") {
            return res.status(400).json({ error: 'mode must be "reindex" or "head"' });
        }

        const issuerDoc = await Issuer.findById(id);
        if (!issuerDoc) return res.status(404).json({ error: "Issuer not found" });
        if (!issuerDoc.deployed_to) return res.status(400).json({ error: "Issuer has no deployed_to" });

        const { default: getProvider } = await import("../chain-operations/getProvider.js");
        const { updateIssuerById } = await import("../db/operations/update.js");

        const provider = getProvider();
        const head = await provider.getBlockNumber();
        const before = issuerDoc.last_processed_block ?? null;
        let target;

        if (mode === "head") {
            const buffer = Math.max(0, Number(req.body?.buffer ?? 0));
            target = Math.max(head - buffer, 0);
        } else {
            // reindex from deploy
            if (!issuerDoc.tx_hash) {
                return res.status(400).json({ error: "Issuer has no tx_hash; cannot reindex from deploy" });
            }
            const receipt = await provider.getTransactionReceipt(issuerDoc.tx_hash);
            if (!receipt?.blockNumber) {
                return res.status(400).json({ error: "Deploy receipt not found for issuer tx_hash" });
            }
            target = Math.max(receipt.blockNumber - 1, 0);
        }

        await updateIssuerById(id, { last_processed_block: target });

        res.status(200).json({
            issuerId: id,
            mode,
            head,
            last_processed_block_before: before,
            last_processed_block: target,
            message:
                mode === "head"
                    ? `Poller jumped to ${target} (head ${head}). Events in any skipped gap are NOT replayed.`
                    : `Poller reindex from deploy (block ${target + 1}). Events will reprocess over the next poll cycles.`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error?.message || error) });
    }
});

export default issuer;
