import { toQuantity } from "ethers";
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
import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID.js";
import { extractArrays } from "../utils/flattenPreprocessorCache.js";

import { initiateSeeding, seedActivePositionsAndActiveSecurityIds, verifyIssuerAndSeed } from "./seed.js";

const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
};

async function startOnchainListeners(contract, provider, issuerId, libraries) {
    console.log("🌐| Initiating on-chain event listeners for ", contract.target);

    // console.log("libraries ", { ...libraries });

    contract.on("IssuerCreated", async (id, _) => {
        console.log("IssuerCreated Event Emitted!", id);

        const uuid = convertBytes16ToUUID(id);
        const issuer = await readIssuerById(uuid);

        if (!issuer.is_manifest_created) return;

        const arrays = extractArrays(preProcessorCache[issuerId]);
        await seedActivePositionsAndActiveSecurityIds(arrays, contract);

        await initiateSeeding(uuid, contract);
        console.log(`Completed Seeding issuer ${uuid} on chain`);

        console.log("checking pre-processor cache ", JSON.stringify(preProcessorCache[issuerId], null, 2));
    });

    contract.on("StakeholderCreated", async (id, _) => {
        console.log("StakeholderCreated Event Emitted!", id);

        const incomingStakeholderId = convertBytes16ToUUID(id);

        const stakeholder = await updateStakeholderById(incomingStakeholderId, { is_onchain_synced: true });

        console.log("✅ | Stakeholder confirmation onchain ", stakeholder);
    });

    contract.on("StockClassCreated", async (id, _) => {
        console.log("StockClassCreated Event Emitted!", id);

        const incomingStockClassId = convertBytes16ToUUID(id);

        const stockClass = await updateStockClassById(incomingStockClassId, { is_onchain_synced: true });

        console.log("✅ | StockClass confirmation onchain ", stockClass);
    });

    // @dev events return both an array and object, depending how you want to access. We're using objects
    libraries.issuance.on("StockIssuanceCreated", async (stock, event) => {
        console.log("StockIssuanceCreated Event Emitted!", stock.id);

        // console.log(`Stock issuance with quantity ${toDecimal(stock.quantity).toString()} received at `, new Date(Date.now()).toLocaleDateString());

        // TODO: (Victor): Think about data validation if the transaction is created onchain, without going through the API
        const sharePriceOCF = {
            amount: toDecimal(stock.share_price).toString(),
            currency: "USD",
        };

        const block = await provider.getBlock(event.blockNumber);
        // Type represention of an ISO-8601 date, e.g. 2022-01-28.
        // TODO: I think if we want to back date historial transactions we will need an option to either pass date or create new one from block
        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];
        const costBasisOCF = { amount: toDecimal(stock.cost_basis).toString(), currency: "USD" };
        const share_numbers_issuedOCF = [
            {
                starting_share_number: toDecimal(stock.share_numbers_issued.starting_share_number).toString(),
                ending_share_number: toDecimal(stock.share_numbers_issued.ending_share_number).toString(),
            },
        ];

        const stakeholder = await readStakeholderById(convertBytes16ToUUID(stock.stakeholder_id));

        const id = convertBytes16ToUUID(stock.id);
        const createdStockIssuance = await upsertStockIssuanceById(id, {
            _id: id,
            object_type: stock.object_type,
            stock_class_id: convertBytes16ToUUID(stock.stock_class_id),
            stock_plan_id: convertBytes16ToUUID(stock.stock_plan_id),
            share_numbers_issued: share_numbers_issuedOCF,
            share_price: sharePriceOCF,
            quantity: toDecimal(stock.quantity).toString(),
            vesting_terms_id: convertBytes16ToUUID(stock.vesting_terms_id),
            cost_basis: costBasisOCF,
            stock_legend_ids: convertBytes16ToUUID(stock.stock_legend_ids),
            issuance_type: stock.issuance_type,
            comments: stock.comments,
            security_id: convertBytes16ToUUID(stock.security_id),
            date: dateOCF,
            custom_id: convertBytes16ToUUID(stock.custom_id), //TODO: is this uuid or custom id?
            stakeholder_id: stakeholder._id,
            board_approval_date: stock.board_approval_date,
            stockholder_approval_date: stock.stockholder_approval_date,
            consideration_text: stock.consideration_text,
            security_law_exemptions: stock.security_law_exemptions,
            // TAP Native Fields
            issuer: issuerId,
            is_onchain_synced: true,
        });

        // console.log("Stock Issuance reflected and validated offchain", createdStockIssuance);

        const createdHistoricalTransaction = await createHistoricalTransaction({
            transaction: createdStockIssuance._id,
            issuer: issuerId,
            transactionType: "StockIssuance",
        });

        console.log(
            `✅ | StockIssuance confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockIssuance
        );

        // console.log("Historical Transaction created", createdHistoricalTransaction);
    });

    libraries.transfer.on("StockTransferCreated", async (stock, event) => {
        console.log("StockTransferCreated Event Emitted!", stock.id);

        // console.log(`Stock Transfer with quantity ${toDecimal(stock.quantity).toString()} received at `, new Date(Date.now()).toLocaleDateString());

        const id = convertBytes16ToUUID(stock.id);
        const createdStockTransfer = await upsertStockTransferById(id, {
            _id: id,
            object_type: stock.object_type,
            quantity: toDecimal(stock.quantity).toString(),
            comments: stock.comments,
            security_id: convertBytes16ToUUID(stock.security_id),
            consideration_text: stock.consideration_text,
            balance_security_id: convertBytes16ToUUID(stock.balance_security_id),
            resulting_security_ids: convertBytes16ToUUID(stock.resulting_security_ids),
            // TAP Native Fields
            issuer: issuerId,
            is_onchain_synced: true,
        });

        console.log("Stock Transfer reflected and validated offchain", createdStockTransfer);

        const createdHistoricalTransaction = await createHistoricalTransaction({
            transaction: createdStockTransfer._id,
            issuer: createdStockTransfer.issuer,
            transactionType: "StockTransfer",
        });

        console.log(
            `✅ | StockTransfer confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockTransfer
        );

        // console.log("Historical Transaction created", createdHistoricalTransaction);
    });

    libraries.cancellation.on("StockCancellationCreated", async (stock) => {
        console.log("StockCancellationCreated Event Emitted!", stock.id);
        const id = convertBytes16ToUUID(stock.id);
        const createdStockCancellation = await upsertStockCancellationById(id, {
            _id: id,
            object_type: stock.object_type,
            quantity: toDecimal(stock.quantity).toString(),
            comments: stock.comments,
            security_id: convertBytes16ToUUID(stock.security_id),
            // date: new Date(Date.now()), // why can't we pull it from stock?
            reason_text: stock.reason_text,
            balance_security_id: convertBytes16ToUUID(stock.balance_security_id),
            // TAP Native Fields
            issuer: issuerId,
            is_onchain_synced: true,
        });

        const createdHistoricalTransaction = await createHistoricalTransaction({
            transaction: createdStockCancellation._id,
            issuer: createdStockCancellation.issuer,
            transactionType: "StockCancellation",
        });
        console.log(
            `✅ | StockCancellation confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockCancellation
        );
    });

    libraries.retraction.on("StockRetractionCreated", async (stock) => {
        console.log("StockRetractionCreated Event Emitted!", stock.id);
        const id = convertBytes16ToUUID(stock.id);
        const createdStockRetraction = await upsertStockRetractionById(id, {
            _id: id,
            object_type: stock.object_type,
            comments: stock.comments,
            security_id: convertBytes16ToUUID(stock.security_id),
            date: new Date(Date.now()),
            reason_text: stock.reason_text,
            // TAP Native Fields
            issuer: issuerId,
            is_onchain_synced: true,
        });

        await createHistoricalTransaction({
            transaction: createdStockRetraction._id,
            issuer: createdStockRetraction.issuer,
            transactionType: "StockRetraction",
        });
        console.log(
            `✅ | StockRetraction confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockRetraction
        );
    });

    libraries.reissuance.on("StockReissuanceCreated", async (stock) => {
        console.log("StockReissuanceCreated Event Emitted!", stock.id);

        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];

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
        });

        await createHistoricalTransaction({
            transaction: createdStockReissuance._id,
            issuer: createdStockReissuance.issuer,
            transactionType: "StockReissuance",
        });
        console.log(
            `✅ | StockReissuance confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockReissuance
        );
    });

    libraries.repurchase.on("StockRepurchaseCreated", async (stock) => {
        console.log("StockRepurchaseCreated Event Emitted!", stock.id);
        const id = convertBytes16ToUUID(stock.id);
        console.log("stock price", stock.price);

        const sharePriceOCF = {
            amount: toDecimal(stock.price).toString(),
            currency: "USD",
        };

        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];

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
        });

        await createHistoricalTransaction({
            transaction: createdStockRepurchase._id,
            issuer: createdStockRepurchase.issuer,
            transactionType: "StockRepurchase",
        });
        console.log(
            `✅ | StockRepurchase confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockRepurchase
        );
    });

    libraries.acceptance.on("StockAcceptanceCreated", async (stock) => {
        console.log("StockAcceptanceCreated Event Emitted!", stock.id);
        const id = convertBytes16ToUUID(stock.id);
        console.log("stock price", stock.price);

        const createdStockAcceptance = await upsertStockAcceptanceById(id, {
            _id: id,
            object_type: stock.object_type,
            comments: stock.comments,
            security_id: convertBytes16ToUUID(stock.security_id),
            date: new Date(Date.now()),

            // TAP Native Fields
            issuer: issuerId,
            is_onchain_synced: true,
        });

        await createHistoricalTransaction({
            transaction: createdStockAcceptance._id,
            issuer: createdStockAcceptance.issuer,
            transactionType: "StockAcceptance",
        });
        console.log(
            `✅ | StockAcceptance confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockAcceptance
        );
    });

    libraries.adjustment.on("StockClassAuthorizedSharesAdjusted", async (stock) => {
        console.log("StockClassAuthorizedSharesAdjusted Event Emitted!", stock.id);
        const id = convertBytes16ToUUID(stock.id);
        console.log("stock price", stock.price);

        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];

        // this is getting heavy
        const upsert = await upsertStockClassAuthorizedSharesAdjustment(id, {
            _id: id,
            object_type: stock.object_type,
            comments: stock.comments,
            issuer_id: convertBytes16ToUUID(stock.security_id),
            date: dateOCF,
            new_shares_authorized: stock.new_shares_authorized,
            board_approval_date: stock.board_approval_date,
            stockholder_approval_date: stock.stockholder_approval_date,

            // TAP Native Fields
            issuer: issuerId,
            is_onchain_synced: true,
        });

        await createHistoricalTransaction({
            transaction: upsert._id,
            issuer: issuerId,
            transactionType: "StockClassAuthorizedSharesAdjustment",
        });
        console.log(
            `✅ | StockClassAuthorizedSharesAdjusted confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            upsert
        );
    });

    libraries.adjustment.on("IssuerAuthorizedSharesAdjusted", async (issuer) => {
        console.log("IssuerAuthorizedSharesAdjusted Event Emitted!", issuer.id);
        const id = convertBytes16ToUUID(issuer.id);
        console.log("stock price", issuer.price);

        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];

        // this is getting heavy
        const upsert = await upsertIssuerAuthorizedSharesAdjustment(id, {
            _id: id,
            object_type: issuer.object_type,
            comments: issuer.comments,
            issuer_id: convertBytes16ToUUID(issuer.security_id),
            date: dateOCF,
            new_shares_authorized: issuer.new_shares_authorized,
            board_approval_date: issuer.board_approval_date,
            stockholder_approval_date: issuer.stockholder_approval_date,

            // TAP Native Fields
            issuer: issuerId,
            is_onchain_synced: true,
        });

        await createHistoricalTransaction({
            transaction: upsert._id,
            issuer: issuerId,
            transactionType: "IssuerAuthorizedSharesAdjustment",
        });
        console.log(
            `✅ | IssuerAuthorizedSharesAdjusted confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            upsert
        );
    });

    const issuerCreatedFilter = contract.filters.IssuerCreated;
    const issuerEvents = await contract.queryFilter(issuerCreatedFilter);

    // TODO: should only be performed once.
    if (issuerEvents.length > 0) {
        const id = issuerEvents[0].args[0];
        console.log("IssuerCreated Event Emitted!", id);

        await verifyIssuerAndSeed(contract, id);
    }
}

export default startOnchainListeners;
