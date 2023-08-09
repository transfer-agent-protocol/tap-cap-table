import { ethers } from "ethers";

import { config } from "dotenv";
config();

import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
const CAP_TABLE_ABI = CAP_TABLE.abi;

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

    return contract;
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

async function startOnchainListeners(chain) {
    let contract;
    if (chain === "local") {
        contract = await localSetup();
    }

    if (chain === "optimism-goerli") {
        contract = await optimismGoerliSetup();
    }

    console.log("Listening for on-chain events...");

    contract.on("StockIssuanceCreated", (stock, event) => {
        console.log("StockIssuanceCreated Event Emitted!");

        console.log("ID:", stock.id);
        console.log("Object Type:", stock.object_type);
        console.log("Stock Class ID:", stock.stock_class_id);
        console.log("Stock Plan ID:", stock.stock_plan_id);
        console.log("Share Price:", stock.share_price.toString());
        console.log("Quantity:", stock.quantity.toString());
        console.log("Vesting Terms ID:", stock.vesting_terms_id);
        console.log("Cost Basis:", stock.cost_basis);

        console.log("Stock Legend IDs:");
        stock.stock_legend_ids.forEach((id) => console.log(id));

        console.log("Issuance Type:", stock.issuance_type);

        console.log("Comments:");
        stock.comments.forEach((comment) => console.log(comment));

        console.log("Security ID:", stock.security_id);
        console.log("Stakeholder ID:", stock.stakeholder_id);
        console.log("Board Approval Date:", stock.board_approval_date);
        console.log("Stockholder Approval Date:", stock.stockholder_approval_date);
        console.log("Consideration Text:", stock.consideration_text);

        console.log("Security Law Exemptions:");
        stock.security_law_exemptions.forEach((exemption) => console.log(exemption));

        // Access additional event properties if needed
        console.log("Event Block Number:", event.blockNumber);

        // Any additional logic here...
    });

    contract.on("error", (error) => {
        console.error("Error:", error);
    });
}

export default startOnchainListeners;
