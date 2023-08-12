import getContractInstance from "./getContractInstances.js";
import { convertBytes16ToUUID } from "../utils/convertUUID.js";

async function startOnchainListeners(chain, prisma) {
    console.log("🌐  Initiating on-chain event listeners... Stand by.");

    const { contract, provider } = await getContractInstance(chain);

    contract.on("error", (error) => {
        console.error("Error:", error);
    });

    // Assuming you already have a Contract instance "contract"
    contract.on("StockIssuanceCreated", async (stock, event) => {
        console.log("StockIssuanceCreated Event Emitted!");

        // TODO: need a conversion from solidity types to OCF types. Beginning with POC
        const sharePriceOCF = {
            amount: stock.share_price.toString(),
            currency: "USD",
        };
        const block = await provider.getBlock(event.blockNumber);
        // Type represention of an ISO-8601 date, e.g. 2022-01-28
        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];
        const costBasisOCF = stock.cost_basis.toString ? { amount: stock.cost_basis.toString(), currency: "USD" } : {};

        const stockIssuance = convertBytes16ToUUID(stock);

        const createdStockIssuance = await prisma.stockIssuance.create({
            data: {
                id: stockIssuance.id,
                object_type: stockIssuance.object_type,
                stock_class_id: stockIssuance.stock_class_id,
                stock_plan_id: stockIssuance.stock_plan_id,
                share_numbers_issued: stockIssuance.share_numbers_issued.toString(), // OCF structure is [{}], check how it returns
                share_price: sharePriceOCF,
                quantity: stock.quantity.toString(),
                vesting_terms_id: stockIssuance.vesting_terms_id,
                cost_basis: costBasisOCF,
                stock_legend_ids: stockIssuance.stock_legend_ids,
                issuance_type: stockIssuance.issuance_type,
                comments: stockIssuance.comments,
                security_id: stockIssuance.security_id,
                date: dateOCF,
                custom_id: stockIssuance.custom_id,
                stakeholder_id: stockIssuance.stakeholder_id,
                board_approval_date: stockIssuance.board_approval_date,
                stockholder_approval_date: stockIssuance.stockholder_approval_date,
                consideration_text: stockIssuance.consideration_text,
                security_law_exemptions: stockIssuance.security_law_exemptions,
            },
        });

        console.log("New Stock Issuance Object Created !", createdStockIssuance);
    });
}

export default startOnchainListeners;
