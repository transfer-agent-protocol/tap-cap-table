import { v4 as uuidv4 } from "uuid";
import { ethers } from "ethers";
import { config } from "dotenv";
config();

import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
const CAP_TABLE_ABI = CAP_TABLE.abi;
// import { localSetup, optimismGoerliSetup } from "./chainSetup";

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
