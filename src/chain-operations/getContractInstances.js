import { ethers } from "ethers";
import { config } from "dotenv";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import getTXLibContracts from "../utils/getLibrariesContracts.js";

config();


async function getLocalContractInstance(address) {
    const CONTRACT_ADDRESS_LOCAL = address;

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL;

    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL, customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, CAP_TABLE.abi, wallet);
    const libraries = getTXLibContracts(contract.target, wallet)
    return { contract, provider, libraries };
}

async function getOptimismGoerliContractInstance(address) {
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = address;
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.JsonRpcProvider(process.env.L2_TESTNET_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, abi, wallet);
    const libraries = getTXLibContracts(contract.target, wallet)


    return { contract, provider, libraries};
}

async function getContractInstance(chain, address) {
    if (chain === "local") {
        return getLocalContractInstance(address);
    } else if (chain === "optimism-goerli") {
        return getOptimismGoerliContractInstance(address);
    } else {
        throw new Error(`Unsupported chain: ${chain}`);
    }
}

export default getContractInstance;
