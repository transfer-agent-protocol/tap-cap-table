import { Interface } from "ethers";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" with { type: "json" };
import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import { createHistoricalTransaction } from "../db/operations/create.js";
import { readStakeholderById } from "../db/operations/read.js";
import {
    updateStakeholderById,
    updateStockClassById,
    upsertStockIssuanceById,
    upsertStockTransferById,
    upsertStockCancellationById,
    upsertStockRetractionById,
    upsertStockReissuanceById,
    upsertStockRepurchaseById,
    upsertStockAcceptanceById,
    upsertStockClassAuthorizedSharesAdjustment,
    upsertIssuerAuthorizedSharesAdjustment,
} from "../db/operations/update.js";

import { toDecimal } from "../utils/convertToFixedPointDecimals.js";

// Server issuances JSON-encode each OCF exemption object into the struct's string[]. Anything that
// is not a JSON object (older rows, the app's []) is kept as it is.
const parseExemption = (entry) => {
    try {
        const parsed = JSON.parse(entry);
        return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : entry;
    } catch {
        return entry;
    }
};

const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
};
export const handleStockIssuance = async (stock, issuerId, timestamp, meta = {}) => {
    const currency = "USD";
    const { id, object_type, security_id, params } = stock;
    const txHash = meta?.txHash || null;
    console.log("StockIssuanceCreated Event Emitted!", id, txHash || "");
    const {
        stock_class_id,
        stock_plan_id,
        share_numbers_issued: { starting_share_number, ending_share_number },
        share_price,
        quantity,
        vesting_terms_id,
        cost_basis,
        stock_legend_ids,
        issuance_type,
        comments,
        custom_id,
        stakeholder_id,
        board_approval_date,
        stockholder_approval_date,
        consideration_text,
        security_law_exemptions,
    } = params;
    const sharePriceOCF = {
        amount: toDecimal(share_price, currency).toString(),
        currency,
    };

    // Type represention of an ISO-8601 date, e.g. 2022-01-28.
    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];
    const costBasisOCF = { amount: toDecimal(cost_basis, currency).toString(), currency };
    const share_numbers_issuedOCF = [
        {
            starting_share_number: toDecimal(starting_share_number).toString(),
            ending_share_number: toDecimal(ending_share_number).toString(),
        },
    ];

    const stakeholder = await readStakeholderById(convertBytes16ToUUID(stakeholder_id));
    if (!stakeholder) {
        throw Error("Stakeholder does not exist");
    }

    const _id = convertBytes16ToUUID(id);
    const createdStockIssuance = await upsertStockIssuanceById(_id, {
        _id,
        object_type,
        stock_class_id: convertBytes16ToUUID(stock_class_id),
        stock_plan_id: convertBytes16ToUUID(stock_plan_id),
        share_numbers_issued: share_numbers_issuedOCF,
        share_price: sharePriceOCF,
        quantity: toDecimal(quantity).toString(),
        vesting_terms_id: convertBytes16ToUUID(vesting_terms_id),
        cost_basis: costBasisOCF,
        stock_legend_ids: convertBytes16ToUUID(stock_legend_ids),
        issuance_type: issuance_type,
        comments: comments,
        security_id: convertBytes16ToUUID(security_id),
        date: dateOCF,
        custom_id, // Not UUID
        stakeholder_id: stakeholder._id,
        board_approval_date,
        stockholder_approval_date,
        consideration_text,
        security_law_exemptions: security_law_exemptions.map(parseExemption),
        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: createdStockIssuance._id,
        issuer: issuerId,
        transactionType: "StockIssuance",
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    console.log(
        `✅ | StockIssuance confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        createdStockIssuance
    );
};

export const handleStockTransfer = async (stock, issuerId, _timestamp, meta = {}) => {
    console.log(`Stock Transfer with quantity ${toDecimal(stock.quantity).toString()} received at `, new Date(Date.now()).toLocaleDateString());
    const txHash = meta?.txHash || null;

    const id = convertBytes16ToUUID(stock.id);
    const quantity = toDecimal(stock.quantity).toString();
    const createdStockTransfer = await upsertStockTransferById(id, {
        _id: id,
        object_type: stock.object_type,
        quantity,
        comments: stock.comments,
        security_id: convertBytes16ToUUID(stock.security_id),
        consideration_text: stock.consideration_text,
        balance_security_id: convertBytes16ToUUID(stock.balance_security_id),
        resulting_security_ids: convertBytes16ToUUID(stock.resulting_security_ids),
        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    console.log("Stock Transfer reflected and validated off-chain", createdStockTransfer);

    await createHistoricalTransaction({
        transaction: createdStockTransfer._id,
        issuer: createdStockTransfer.issuer,
        transactionType: "StockTransfer",
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    console.log(
        `✅ | StockTransfer confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        createdStockTransfer
    );
};
export const handleStakeholder = async (id, meta = {}) => {
    console.log("StakeholderCreated Event Emitted!", id);
    const incomingStakeholderId = convertBytes16ToUUID(id);
    const patch = { is_onchain_synced: true };
    if (meta?.txHash) patch.tx_hash = meta.txHash;
    const stakeholder = await updateStakeholderById(incomingStakeholderId, patch);
    console.log("✅ | Stakeholder confirmation onchain ", stakeholder);
};

export const handleStockClass = async (id, meta = {}) => {
    console.log("StockClassCreated Event Emitted!", id);
    const incomingStockClassId = convertBytes16ToUUID(id);
    const patch = { is_onchain_synced: true };
    if (meta?.txHash) patch.tx_hash = meta.txHash;
    const stockClass = await updateStockClassById(incomingStockClassId, patch);
    console.log("✅ | StockClass confirmation onchain ", stockClass);
};

export const handleStockCancellation = async (stock, issuerId, timestamp, meta = {}) => {
    console.log("StockCancellationCreated Event Emitted!", stock.id);
    const txHash = meta?.txHash || null;
    const id = convertBytes16ToUUID(stock.id);
    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];
    const createdStockCancellation = await upsertStockCancellationById(id, {
        _id: id,
        object_type: stock.object_type,
        quantity: toDecimal(stock.quantity).toString(),
        comments: stock.comments,
        security_id: convertBytes16ToUUID(stock.security_id),
        date: dateOCF,
        reason_text: stock.reason_text,
        balance_security_id: convertBytes16ToUUID(stock.balance_security_id),
        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: createdStockCancellation._id,
        issuer: createdStockCancellation.issuer,
        transactionType: "StockCancellation",
        ...(txHash ? { tx_hash: txHash } : {}),
    });
    console.log(
        `✅ | StockCancellation confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        createdStockCancellation
    );
};

export const handleStockRetraction = async (stock, issuerId, timestamp, meta = {}) => {
    console.log("StockRetractionCreated Event Emitted!", stock.id);
    const txHash = meta?.txHash || null;
    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];
    const id = convertBytes16ToUUID(stock.id);
    const createdStockRetraction = await upsertStockRetractionById(id, {
        _id: id,
        object_type: stock.object_type,
        comments: stock.comments,
        security_id: convertBytes16ToUUID(stock.security_id),
        date: dateOCF,
        reason_text: stock.reason_text,
        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: createdStockRetraction._id,
        issuer: createdStockRetraction.issuer,
        transactionType: "StockRetraction",
        ...(txHash ? { tx_hash: txHash } : {}),
    });
    console.log(
        `✅ | StockRetraction confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        createdStockRetraction
    );
};

export const handleStockReissuance = async (stock, issuerId, timestamp, meta = {}) => {
    console.log("StockReissuanceCreated Event Emitted!", stock.id);
    const txHash = meta?.txHash || null;
    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];
    const id = convertBytes16ToUUID(stock.id);
    const createdStockReissuance = await upsertStockReissuanceById(id, {
        _id: id,
        object_type: stock.object_type,
        comments: stock.comments,
        security_id: convertBytes16ToUUID(stock.security_id),
        date: dateOCF,
        reason_text: stock.reason_text,
        resulting_security_ids: stock.resulting_security_ids.map((sId) => convertBytes16ToUUID(sId)),
        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: createdStockReissuance._id,
        issuer: createdStockReissuance.issuer,
        transactionType: "StockReissuance",
        ...(txHash ? { tx_hash: txHash } : {}),
    });
    console.log(
        `✅ | StockReissuance confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        createdStockReissuance
    );
};

export const handleStockRepurchase = async (stock, issuerId, timestamp, meta = {}) => {
    console.log("StockRepurchaseCreated Event Emitted!", stock.id);
    const txHash = meta?.txHash || null;
    const id = convertBytes16ToUUID(stock.id);

    const sharePriceOCF = {
        amount: toDecimal(stock.price).toString(),
        currency: "USD",
    };

    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];

    const createdStockRepurchase = await upsertStockRepurchaseById(id, {
        _id: id,
        object_type: stock.object_type,
        comments: stock.comments,
        security_id: convertBytes16ToUUID(stock.security_id),
        date: dateOCF,
        price: sharePriceOCF,
        quantity: toDecimal(stock.quantity).toString(),
        consideration_text: stock.consideration_text,
        balance_security_id: convertBytes16ToUUID(stock.balance_security_id),

        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: createdStockRepurchase._id,
        issuer: createdStockRepurchase.issuer,
        transactionType: "StockRepurchase",
        ...(txHash ? { tx_hash: txHash } : {}),
    });
    console.log(
        `✅ | StockRepurchase confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        createdStockRepurchase
    );
};

export const handleStockAcceptance = async (stock, issuerId, timestamp, meta = {}) => {
    console.log("StockAcceptanceCreated Event Emitted!", stock.id);
    const txHash = meta?.txHash || null;
    const id = convertBytes16ToUUID(stock.id);
    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];

    const createdStockAcceptance = await upsertStockAcceptanceById(id, {
        _id: id,
        object_type: stock.object_type,
        comments: stock.comments,
        security_id: convertBytes16ToUUID(stock.security_id),
        date: dateOCF,

        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: createdStockAcceptance._id,
        issuer: createdStockAcceptance.issuer,
        transactionType: "StockAcceptance",
        ...(txHash ? { tx_hash: txHash } : {}),
    });
    console.log(
        `✅ | StockAcceptance confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        createdStockAcceptance
    );
};

const capTableInterface = new Interface(CAP_TABLE.abi);
const loggedStockClassMisses = new Set();

/**
 * The onchain StockClassAuthorizedSharesAdjustment struct has no stock_class_id, so read it back
 * from the adjustStockClassAuthorizedShares calldata of the emitting tx. Returns null when the call
 * went through another contract (e.g. a multisig) or the tx cannot be fetched or decoded.
 */
export const recoverAdjustedStockClassId = async (provider, txHash, capTableAddress) => {
    let reason;
    try {
        const tx = await provider.getTransaction(txHash);
        if (!tx) {
            reason = "transaction not found";
        } else if (capTableAddress && tx.to?.toLowerCase() !== capTableAddress.toLowerCase()) {
            reason = `sent to ${tx.to}, not the cap table`;
        } else {
            const call = capTableInterface.parseTransaction({ data: tx.data, value: tx.value });
            if (call?.name === "adjustStockClassAuthorizedShares") {
                return convertBytes16ToUUID(call.args[0]);
            }
            reason = `calldata is ${call?.name ?? "not a CapTable call"}`;
        }
    } catch (err) {
        reason = err?.shortMessage || err?.message || String(err);
    }
    // Replays and retried DB transactions hit the same tx again; say it once.
    if (!loggedStockClassMisses.has(txHash)) {
        loggedStockClassMisses.add(txHash);
        console.warn(`StockClassAuthorizedSharesAdjusted: no stock_class_id for tx ${txHash} (${reason}); storing null`);
    }
    return null;
};

export const handleStockClassAuthorizedSharesAdjusted = async (stock, issuerId, timestamp, meta = {}) => {
    console.log("StockClassAuthorizedSharesAdjusted Event Emitted!", stock.id);
    const txHash = meta?.txHash || null;
    const id = convertBytes16ToUUID(stock.id);
    const stockClassId = await recoverAdjustedStockClassId(meta?.provider, txHash, meta?.address);

    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];

    const upsert = await upsertStockClassAuthorizedSharesAdjustment(id, {
        _id: id,
        object_type: stock.object_type,
        comments: stock.comments,
        date: dateOCF,
        new_shares_authorized: toDecimal(stock.new_shares_authorized).toString(),
        board_approval_date: stock.board_approval_date,
        stockholder_approval_date: stock.stockholder_approval_date,
        // null only on insert: a replay that cannot reach the RPC must not erase a recovered id
        ...(stockClassId ? { stock_class_id: stockClassId } : { $setOnInsert: { stock_class_id: null } }),

        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: upsert._id,
        issuer: issuerId,
        transactionType: "StockClassAuthorizedSharesAdjustment",
        ...(txHash ? { tx_hash: txHash } : {}),
    });
    console.log(
        `✅ | StockClassAuthorizedSharesAdjusted confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        upsert
    );
};

export const handleIssuerAuthorizedSharesAdjusted = async (issuer, issuerId, timestamp, meta = {}) => {
    console.log("IssuerAuthorizedSharesAdjusted Event Emitted!", issuer.id);
    const txHash = meta?.txHash || null;
    const id = convertBytes16ToUUID(issuer.id);

    const dateOCF = new Date(timestamp * 1000).toISOString().split("T")[0];

    const upsert = await upsertIssuerAuthorizedSharesAdjustment(id, {
        _id: id,
        object_type: issuer.object_type,
        comments: issuer.comments,
        issuer_id: issuerId,
        date: dateOCF,
        new_shares_authorized: toDecimal(issuer.new_shares_authorized).toString(),
        board_approval_date: issuer.board_approval_date,
        stockholder_approval_date: issuer.stockholder_approval_date,

        // TAP Native Fields
        issuer: issuerId,
        is_onchain_synced: true,
        ...(txHash ? { tx_hash: txHash } : {}),
    });

    await createHistoricalTransaction({
        transaction: upsert._id,
        issuer: issuerId,
        transactionType: "IssuerAuthorizedSharesAdjustment",
        ...(txHash ? { tx_hash: txHash } : {}),
    });
    console.log(
        `✅ | IssuerAuthorizedSharesAdjusted confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
        upsert
    );
};
