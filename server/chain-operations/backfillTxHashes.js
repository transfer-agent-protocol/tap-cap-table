/**
 * Fill missing tx_hash on HistoricalTransaction, StockIssuance, Stakeholder, StockClass
 * by scanning onchain logs. The original poller often never stored ethereum hashes.
 */
import { AbiCoder } from "ethers";
import HistoricalTransaction from "../db/objects/HistoricalTransaction.js";
import Stakeholder from "../db/objects/Stakeholder.js";
import StockClass from "../db/objects/StockClass.js";
import { StockIssuance } from "../db/objects/transactions/issuance/index.js";
import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import { getIssuerContract } from "../utils/caches.ts";
import {
    IssuerAuthorizedSharesAdjustment,
    StockAcceptance,
    StockCancellation,
    StockClassAuthorizedSharesAdjustment,
    StockIssuance as StockIssuanceStruct,
    StockReissuance,
    StockRepurchase,
    StockRetraction,
    StockTransfer,
} from "./structs.js";

const abiCoder = new AbiCoder();

const TYPE_STRUCTS = {
    1: IssuerAuthorizedSharesAdjustment,
    2: StockClassAuthorizedSharesAdjustment,
    3: StockAcceptance,
    4: StockCancellation,
    5: StockIssuanceStruct,
    6: StockReissuance,
    7: StockRepurchase,
    8: StockRetraction,
    9: StockTransfer,
};

const CHUNK = Number.parseInt(process.env.TX_HASH_BACKFILL_CHUNK || "20000", 10) || 20000;

const extractOcfId = (typeIdx, txData) => {
    const struct = TYPE_STRUCTS[Number(typeIdx)];
    if (!struct) return null;
    try {
        const decoded = abiCoder.decode([struct], txData);
        const row = decoded[0];
        const rawId = row?.id;
        if (rawId == null) return null;
        return convertBytes16ToUUID(rawId);
    } catch {
        return null;
    }
};

const missingHashFilter = {
    $or: [{ tx_hash: null }, { tx_hash: { $exists: false } }, { tx_hash: "" }],
};

/**
 * @param {object} issuerDoc
 */
export async function backfillTxHashesForIssuer(issuerDoc) {
    if (!issuerDoc?.deployed_to || !issuerDoc?.tx_hash) {
        return { updated: 0, scanned: 0, stillMissing: 0, message: "Issuer missing deployed_to or tx_hash" };
    }

    const [missingHist, missingPeople, missingClasses] = await Promise.all([
        HistoricalTransaction.find({ issuer: issuerDoc._id, ...missingHashFilter }).lean(),
        Stakeholder.find({ issuer: issuerDoc._id, ...missingHashFilter }).select("_id").lean(),
        StockClass.find({ issuer: issuerDoc._id, ...missingHashFilter }).select("_id").lean(),
    ]);

    if (missingHist.length === 0 && missingPeople.length === 0 && missingClasses.length === 0) {
        return { updated: 0, scanned: 0, stillMissing: 0, message: "All activity rows already have TX hashes." };
    }

    const needHist = new Map(missingHist.map((m) => [String(m.transaction), m]));
    const needPeople = new Set(missingPeople.map((p) => String(p._id)));
    const needClasses = new Set(missingClasses.map((c) => String(c._id)));

    const { provider, libraries, contract } = await getIssuerContract(issuerDoc);
    const txHelper = libraries.txHelper;

    const receipt = await provider.getTransactionReceipt(issuerDoc.tx_hash);
    if (!receipt?.blockNumber) {
        return {
            updated: 0,
            scanned: 0,
            stillMissing: needHist.size + needPeople.size + needClasses.size,
            message: "Deploy receipt not found",
        };
    }

    let from = receipt.blockNumber;
    const head = await provider.getBlockNumber();
    let scanned = 0;
    let updated = 0;

    while (
        from <= head &&
        (needHist.size > 0 || needPeople.size > 0 || needClasses.size > 0)
    ) {
        const to = Math.min(from + CHUNK - 1, head);

        const queryRange = async (start, end) => {
            const [txEvents, shEvents, scEvents] = await Promise.all([
                txHelper.queryFilter(txHelper.filters.TxCreated, start, end),
                needPeople.size > 0
                    ? contract.queryFilter(contract.filters.StakeholderCreated(), start, end)
                    : Promise.resolve([]),
                needClasses.size > 0
                    ? contract.queryFilter(contract.filters.StockClassCreated(), start, end)
                    : Promise.resolve([]),
            ]);
            return { txEvents, shEvents, scEvents };
        };

        let ranges;
        try {
            ranges = await queryRange(from, to);
        } catch {
            const mid = from + Math.floor((to - from) / 2);
            const a = await queryRange(from, mid);
            const b = await queryRange(mid + 1, to);
            ranges = {
                txEvents: [...a.txEvents, ...b.txEvents],
                shEvents: [...a.shEvents, ...b.shEvents],
                scEvents: [...a.scEvents, ...b.scEvents],
            };
        }

        scanned += ranges.txEvents.length + ranges.shEvents.length + ranges.scEvents.length;

        for (const event of ranges.txEvents) {
            if (event.removed) continue;
            const [, typeIdx, txData] = event.args;
            const ocfId = extractOcfId(typeIdx, txData);
            if (!ocfId || !needHist.has(ocfId)) continue;
            const hash = event.transactionHash;
            await HistoricalTransaction.updateOne(
                { issuer: issuerDoc._id, transaction: ocfId },
                { $set: { tx_hash: hash } }
            );
            if (Number(typeIdx) === 5) {
                await StockIssuance.updateOne({ _id: ocfId }, { $set: { tx_hash: hash } });
            }
            needHist.delete(ocfId);
            updated++;
        }

        for (const event of ranges.shEvents) {
            if (event.removed) continue;
            const idBytes = event.args?.[0];
            const ocfId = convertBytes16ToUUID(idBytes);
            if (!needPeople.has(ocfId)) continue;
            await Stakeholder.updateOne({ _id: ocfId }, { $set: { tx_hash: event.transactionHash } });
            needPeople.delete(ocfId);
            updated++;
        }

        for (const event of ranges.scEvents) {
            if (event.removed) continue;
            const idBytes = event.args?.[0];
            const ocfId = convertBytes16ToUUID(idBytes);
            if (!needClasses.has(ocfId)) continue;
            await StockClass.updateOne({ _id: ocfId }, { $set: { tx_hash: event.transactionHash } });
            needClasses.delete(ocfId);
            updated++;
        }

        from = to + 1;
    }

    const still = needHist.size + needPeople.size + needClasses.size;
    return {
        updated,
        scanned,
        stillMissing: still,
        message:
            updated > 0
                ? `Backfilled ${updated} TX hash(es) from chain logs.`
                : still > 0
                  ? `Scanned logs but ${still} row(s) still have no matching onchain event.`
                  : "No TX hashes needed.",
    };
}

export default backfillTxHashesForIssuer;
