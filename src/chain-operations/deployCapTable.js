import { config } from "dotenv";
import { ethers } from "ethers";
import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import getTXLibContracts from "../utils/getLibrariesContracts.js";

config();

async function deployCapTableLocal(issuerId, issuerName, initial_shares_authorized) {
    // Replace with your private key and provider endpoint
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const customNetwork = {
        chainId: 31337,
        name: "local",
    };
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
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

async function deployCapTableOptimismGoerli(issuerId, issuerName) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
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
        return deployCapTableOptimismGoerli(issuerId, issuerName);
    } else {
        throw new Error(`❌ | Unsupported chain: ${chain}`);
    }
}
export default deployCapTable;
