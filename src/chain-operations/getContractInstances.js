import { config } from "dotenv";
import { ethers } from "ethers";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import getTXLibContracts from "../utils/getLibrariesContracts.js";
import getProvider from "./getProvider.js";

config();

export const getContractInstance = (address) => {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY;

    const provider = getProvider();

    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(address, CAP_TABLE.abi, wallet);
    const libraries = getTXLibContracts(contract.target, wallet);

    return { contract, provider, libraries };
}
