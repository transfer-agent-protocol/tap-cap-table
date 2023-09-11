import getContractInstance from "./getContractInstances.js";
import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import { convertManyToDecimal, toDecimal } from "../utils/convertToFixedPointDecimals.js";
import { updateStakeholderById, updateStockClassById } from "../db/operations/update.js";
import { createStockIssuance } from "../db/operations/create.js";

async function startOnchainListeners(chain) {
    console.log("🌐| Initiating on-chain event listeners...");

    const { contract, provider } = await getContractInstance(chain);

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

        // const quantity = toDecimal(stock.quantity);

        // console.log("quantity", quantity);
    });

    // @dev events return both an array and object, depending how you want to access. We're using objects
    contract.on("StockIssuanceCreated", async (stock, event) => {
        console.log("StockIssuanceCreated Event Emitted!", stock.id);

        // TODO(Victor): Think about data validation

        const sharePriceOCF = {
            amount: toDecimal(stock.share_price).toString(),
            currency: "USD",
        };

        const block = await provider.getBlock(event.blockNumber);
        // Type represention of an ISO-8601 date, e.g. 2022-01-28
        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];
        const costBasisOCF = { amount: toDecimal(stock.cost_basis).toString(), currency: "USD" }
        const share_numbers_issuedOCF = [{
            starting_share_number: toDecimal(stock.share_numbers_issued.starting_share_number).toString(),
            ending_share_number: toDecimal(stock.share_numbers_issued.ending_share_number).toString()
        }]

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
            custom_id: convertBytes16ToUUID(stock.custom_id), // is this uuid or custom id
            stakeholder_id: convertBytes16ToUUID(stock.stakeholder_id),
            board_approval_date: stock.board_approval_date,
            stockholder_approval_date: stock.stockholder_approval_date,
            consideration_text: stock.consideration_text,
            security_law_exemptions: stock.security_law_exemptions,
        });

        console.log("Stock created off-chain", createdStockIssuance);
    });
}

export default startOnchainListeners;
