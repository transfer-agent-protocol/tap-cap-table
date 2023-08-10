import { ethers } from "ethers";
import { config } from "dotenv";
config();

import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
const CAP_TABLE_ABI = CAP_TABLE.abi;
// import { localSetup, optimismGoerliSetup } from "./chainSetup";
import { convertBytes16ToUUID } from "../utils";

async function localSetup() {
    // if deployed using forge script
    //const CONTRACT_ADDRESS_LOCAL = require("../chain/broadcast/CapTable.s.sol/31337/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_LOCAL = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // fill in from capTableFactory

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;

    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, CAP_TABLE_ABI, wallet);

    return { contract, provider };
}

async function optimismGoerliSetup() {
    // if deployed using forge script
    // const CONTRACT_ADDRESS_OPTIMISM_GOERLI = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = "0x027A280A63376308658A571ac2DB5D612bA77912";
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, CAP_TABLE_ABI, wallet);

    return contract;
}

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
