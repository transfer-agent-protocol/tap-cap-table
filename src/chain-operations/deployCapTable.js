import { config } from "dotenv";
import { ethers } from "ethers";
import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import getTXLibContracts from "../utils/getLibrariesContracts.js";

config();

async function deployCapTable(issuerId, issuerName, initial_shares_authorized) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = process.env.RPC_URL;
    const CHAIN_ID = process.env.CHAIN_ID;

    const customNetwork = {
        // Change the CHAIN_ID in the .env file to deploy to a different network
        chainId: parseInt(CHAIN_ID),
    };

    const provider = new ethers.JsonRpcProvider(RPC_URL, customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

    console.log("🗽 | Wallet address: ", wallet.address);

    const factory = new ethers.ContractFactory(CAP_TABLE.abi, CAP_TABLE.bytecode, wallet);
    const contract = await factory.deploy(issuerId, issuerName, toScaledBigNumber(initial_shares_authorized));

    console.log("⏳ | Waiting for contract to be deployed...");

    const libraries = getTXLibContracts(contract.target, wallet);

    console.log("✅ | Contract deployed!");

    return {
        contract,
        provider,
        address: contract.target,
        libraries,
    };
}

export default deployCapTable;