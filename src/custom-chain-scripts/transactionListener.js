import { v4 as uuidv4 } from "uuid";

import { localSetup, optimismGoerliSetup } from "./chainSetup";

async function startOnchainListeners(chain, prisma) {
    let _contract;
    let _provider;
    if (chain === "local") {
        const { contract, provider } = await localSetup();
        _contract = contract;
        _provider = provider;
    }

    if (chain === "optimism-goerli") {
        const { contract, provider } = await optimismGoerliSetup();
        _contract = contract;
        _provider = provider;
    }

    console.log("🌐  Initiating on-chain event listeners... Stand by.");

    _contract.on("error", (error) => {
        console.error("Error:", error);
    });

    // Assuming you already have a Contract instance "contract"
    _contract.on("StockIssuanceCreated", async (stock, event) => {
        console.log("StockIssuanceCreated Event Emitted!");

        // TODO: need a conversion from solidity types to OCF types. Beginning with POC
        const sharePriceOCF = {
            amount: stock.share_price.toString(),
            currency: "USD",
        };
        const block = await _provider.getBlock(event.blockNumber);
        // Type represention of an ISO-8601 date, e.g. 2022-01-28
        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];
        const costBasisOCF = stock.cost_basis.toString ? { amount: stock.cost_basis.toString(), currency: "USD" } : {};

        // TODO: think about data validation and whether we would validate it using OCF here.

        // save to DB
        const stockIssuance = await prisma.stockIssuance.create({
            data: {
                id: uuidv4(), // stock.id is currently a dummy, need to figure out on-chain UUIDs
                object_type: stock.object_type,
                stock_class_id: stock.stock_class_id,
                stock_plan_id: stock.stock_plan_id,
                share_numbers_issued: [{}],
                share_price: sharePriceOCF,
                quantity: stock.quantity.toString(),
                vesting_terms_id: stock.vesting_terms_id,
                cost_basis: costBasisOCF,
                stock_legend_ids: stock.stock_legend_ids,
                issuance_type: stock.issuance_type,
                comments: stock.comments,
                security_id: stock.security_id,
                date: dateOCF,
                custom_id: "", // not using custom ID on-chain
                stakeholder_id: stock.stakeholder_id,
                board_approval_date: stock.board_approval_date,
                stockholder_approval_date: stock.stockholder_approval_date,
                consideration_text: stock.consideration_text,
                security_law_exemptions: stock.security_law_exemptions,
            },
        });

        console.log("New Stock Issuance Object Created !", stockIssuance);
    });
}

export default startOnchainListeners;
