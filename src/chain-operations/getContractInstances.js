import { ethers } from "ethers";
import { config } from "dotenv";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import getTXLibContracts from "../utils/getLibrariesContracts.js";

config();

async function getContractInstance(chain, address) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = process.env.RPC_URL;
    const CHAIN_ID = parseInt(process.env.CHAIN_ID); // Convert to integer

    const customNetwork = {
        chainId: CHAIN_ID, // Use the CHAIN_ID from .env
        name: chain, // Use the chain parameter as the network name
    };

    const provider = new ethers.JsonRpcProvider(RPC_URL, customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(address, CAP_TABLE.abi, wallet);
    const libraries = getTXLibContracts(contract.target, wallet);

    return { contract, provider, libraries };
}

export default getContractInstance;
