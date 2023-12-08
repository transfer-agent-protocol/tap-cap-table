import { config } from "dotenv";
import { ethers } from "ethers";
import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import getTXLibContracts from "../utils/getLibrariesContracts.js";

config();

async function deployCapTableLocal(issuerId, issuerName, initial_shares_authorized) {
    // Use environment variables for private key and provider endpoint
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL; // Use the LOCAL_RPC_URL from .env

    const customNetwork = {
        // TODO: handle changing Anvil's chain id better
        // chainId: 31337,
        // This one is Arbitrum Orbit's chain id
        chainId: 32586980208,
        name: "local",
    };

    // Use the LOCAL_RPC_URL for the provider
    const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL, customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    console.log("🗽 | Wallet address ", wallet.address);

    const factory = new ethers.ContractFactory(CAP_TABLE.abi, CAP_TABLE.bytecode, wallet);
    console.log(
        `✅ | Issuer id inside of deployment: ${issuerId},
        ✅ | Issuer name inside of deployment: ${issuerName},
        ✅ | With initial shares: ${initial_shares_authorized}`
    );

    const contract = await factory.deploy(issuerId, issuerName, toScaledBigNumber(initial_shares_authorized));

    console.log("⏳ | Waiting for contract to be deployed...");
    const libraries = getTXLibContracts(contract.target, wallet);

    return {
        contract,
        provider,
        address: contract.target,
        libraries,
    };
}


async function deployCapTableOptimismGoerli(issuerId, issuerName, initial_shares_authorized) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const factory = new ethers.ContractFactory(CAP_TABLE.abi, CAP_TABLE.bytecode, wallet);
    const contract = await factory.deploy(issuerId, issuerName, toScaledBigNumber(initial_shares_authorized));

    console.log("⏳ | Waiting for contract to be deployed...");

    console.log("✅ | Contract deployed!");

    const libraries = getTXLibContracts(contract.target, wallet);

    return { contract, provider, address: contract.target, libraries };
}

async function deployCapTable(chain, issuerId, issuerName, initial_shares_authorized) {
    if (chain === "local") {
        return deployCapTableLocal(issuerId, issuerName, initial_shares_authorized);
    } else if (chain === "optimism-goerli") {
        return deployCapTableOptimismGoerli(issuerId, issuerName, initial_shares_authorized);
    } else {
        throw new Error(`❌ | Unsupported chain: ${chain}`);
    }
}
export default deployCapTable;
