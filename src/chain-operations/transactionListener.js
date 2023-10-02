import { createHistoricalTransaction, createStockIssuance, createStockTransfer } from "../db/operations/create.js";
import { readStakeholderById, readIssuerById } from "../db/operations/read.js";
import { updateStakeholderById, updateStockClassById, upsertStockTransferById, upsertStockIssuanceById, upsertStockCancellationById} from "../db/operations/update.js";
import { preProcessorCache } from "../utils/caches.js";
import { toDecimal } from "../utils/convertToFixedPointDecimals.js";
import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import { extractArrays } from "../utils/flattenPreprocessorCache.js";

import { initiateSeeding, seedActivePositionsAndActiveSecurityIds } from "./seed.js";

const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
};

async function startOnchainListeners(contract, provider, issuerId) {
    console.log("🌐| Initiating on-chain event listeners for ", contract.address);

    contract.on("error", (error) => {
        console.error("Error:", error);
    });

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
    issuanceLib.on("StockIssuanceCreated", async (stock, event) => {
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

    transferLib.on("StockTransferCreated", async (stock, event) => {
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

    const issuerCreatedFilter = contract.filters.IssuerCreated;
    const issuerEvents = await contract.queryFilter(issuerCreatedFilter);

    if (issuerEvents.length > 0) {
        const id = issuerEvents[0].args[0];
        console.log("IssuerCreated Event Emitted!", id);

        await verifyIssuerAndSeed(contract, id);
    }
    // TODO: Add cancellation listener here
    cancellationLib.on("StockCancellationCreated", async (stock) => {
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
        console.log(
            `✅ | StockCancellation confirmation onchain with date ${new Date(Date.now()).toLocaleDateString("en-US", options)}`,
            createdStockCancellation
        );
    })
}

export default startOnchainListeners;
