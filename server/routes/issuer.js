import { Router } from "express";
import { v4 as uuid } from "uuid";

import issuerSchema from "../../ocf/schema/objects/Issuer.schema.json" with { type: "json" };
import deployCapTable from "../chain-operations/deployCapTable.js";
import { createIssuer } from "../db/operations/create.js";
import { countIssuers, readIssuerById } from "../db/operations/read.js";
import { find } from "../db/operations/atomic.ts";
import Issuer from "../db/objects/Issuer.js";
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

export default issuer;
