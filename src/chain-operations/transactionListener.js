import { createStockIssuance } from "../db/operations/create.js";
import { readStakeholderById } from "../db/operations/read.js";
import { updateStakeholderById, updateStockClassById } from "../db/operations/update.js";
import { toDecimal } from "../utils/convertToFixedPointDecimals.js";
import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import getContractInstance from "./getContractInstances.js";
import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { createStockTransfer } from "../db/operations/create.js";
import { createHistoricalTransaction } from "../db/operations/create.js";

async function startOnchainListeners(contract, provider) {
    console.log("🌐| Initiating on-chain event listeners for ", contract.address);

    contract.on("error", (error) => {
        console.error("Error:", error);
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

    contract.on("StockTransferCreated", async (stock, event) => {
        console.log("StockTransferCreated Event Emitted!", stock.id);

        const securityUUID = await convertBytes16ToUUID(stock.security_id);

        const previousIssuance = await StockIssuance.find({ security_id: securityUUID });

        const createdStockTransfer = await createStockTransfer({
            _id: convertBytes16ToUUID(stock.id),
            object_type: stock.object_type,
            quantity: toDecimal(stock.quantity).toString(),
            comments: stock.comments,
            security_id: convertBytes16ToUUID(stock.security_id),
            consideration_text: stock.consideration_text,
            balance_security_id: convertBytes16ToUUID(stock.balance_security_id),
            resulting_security_ids: convertBytes16ToUUID(stock.resulting_security_ids),
            // TAP Native Fields
            issuer: previousIssuance.issuer,
            is_onchain_synced: true,
        });

        console.log("Stock Transfer reflected and validated offchain", createdStockTransfer);

        const createdHistoricalTransaction = await createHistoricalTransaction({
            transaction_id: createdStockTransfer._id,
            issuer: createdStockTransfer.issuer,
        });

        console.log("Historical Transaction created", createdHistoricalTransaction);
    });

    // @dev events return both an array and object, depending how you want to access. We're using objects
    contract.on("StockIssuanceCreated", async (stock, event) => {
        console.log("StockIssuanceCreated Event Emitted!", stock.id);

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

        const createdStockIssuance = await createStockIssuance({
            _id: convertBytes16ToUUID(stock.id),
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
            issuer: stakeholder.issuer,
            is_onchain_synced: true,
        });

        console.log("Stock Issuance reflected and validated offchain", createdStockIssuance);

        const createdHistoricalTransaction = await createHistoricalTransaction({
            transaction_id: createdStockIssuance._id,
            issuer: createdStockIssuance.issuer,
        });

        console.log("Historical Transaction created", createdHistoricalTransaction);
    });
}

export default startOnchainListeners;
