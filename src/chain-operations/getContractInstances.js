import { ethers } from "ethers";
import { config } from "dotenv";
config();

import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
const { abi } = CAP_TABLE;

async function getLocalContractInstance() {
    // if deployed using forge script
    //const CONTRACT_ADDRESS_LOCAL = require("../chain/broadcast/CapTable.s.sol/31337/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_LOCAL = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // fill in from capTableFactory

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL;

    const customNetwork = {
        chainId: 31337,
        name: "local",
    };
    console.log("LOCAL_RPCURL:", LOCAL_RPC_URL);
    const provider = new ethers.providers.JsonRpcProvider(LOCAL_RPC_URL, customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, abi, wallet);

    return { contract, provider };
}

async function getOptimismGoerliContractInstance() {
    // if deployed using forge script
    // const CONTRACT_ADDRESS_OPTIMISM_GOERLI = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = "0x027A280A63376308658A571ac2DB5D612bA77912";
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, CAP_TABLE_ABI, wallet);

    return { contract, provider };
}

async function getContractInstance(chain) {
    if (chain === "local") {
        return getLocalContractInstance();
    } else if (chain === "optimism-goerli") {
        return getOptimismGoerliContractInstance();
    } else {
        throw new Error(`Unsupported chain: ${chain}`);
    }
}

export default getContractInstance;
