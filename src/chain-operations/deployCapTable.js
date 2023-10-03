import { config } from "dotenv";
import { ethers } from "ethers";

config();

import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import CAP_TABLE_ISSUANCE from "../../chain/out/StockIssuance.sol/StockIssuanceLib.json" assert { type: "json" };
import CAP_TABLE_TRANSFER from "../../chain/out/StockTransfer.sol/StockTransferLib.json" assert { type: "json" };
import CAP_TABLE_CANCELLATION from "../../chain/out/StockCancellation.sol/StockCancellationLib.json" assert { type: "json" };
import CAP_TABLE_RETRACTION from "../../chain/out/StockRetraction.sol/StockRetractionLib.json" assert { type: "json" };

import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";

const { abi, bytecode } = CAP_TABLE;
const { abi: abiIssuance } = CAP_TABLE_ISSUANCE;
const { abi: abiTransfer } = CAP_TABLE_TRANSFER;
const { abi: abiCancellation } = CAP_TABLE_CANCELLATION;
const { abi: abiRetraction } = CAP_TABLE_RETRACTION;

async function deployCapTableLocal(issuerId, issuerName, initial_shares_authorized) {
    // Replace with your private key and provider endpoint
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const customNetwork = {
        chainId: 31337,
        name: "local",
    };
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    console.log("wallet address ", wallet.address);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log(
        "issuer id inside of deployment ",
        issuerId,
        "and issuername inside of deployment ",
        issuerName,
        "with initial shares ",
        initial_shares_authorized
    );

    const contract = await factory.deploy(issuerId, issuerName, toScaledBigNumber(initial_shares_authorized));

    console.log("Waiting for contract to be mined...");

    const libraries = {
        issuance: new ethers.Contract(contract.target, abiIssuance, wallet),
        transfer: new ethers.Contract(contract.target, abiTransfer, wallet),
        cancellation: new ethers.Contract(contract.target, abiCancellation, wallet),
        cancellation: new ethers.Contract(contract.target, abiCancellation, wallet),
        retraction: new ethers.Contract(contract.target, abiRetraction, wallet),
    };

    return {
        contract,
        provider,
        address: contract.target,
        libraries,
    };
}

async function deployCapTableOptimismGoerli(issuerId, issuerName) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(issuerId, issuerName);

    console.log("Waiting for contract to be mined...");
    await contract.deployed();
    console.log("Contract mined!");

    const issuanceLib = new ethers.Contract(contract.target, abiIssuance, wallet);
    const transferLib = new ethers.Contract(contract.target, abiTransfer, wallet);

    return { contract, provider, address: contract.target, issuanceLib, transferLib };
}

async function deployCapTable(chain, issuerId, issuerName, initial_shares_authorized) {
    if (chain === "local") {
        return deployCapTableLocal(issuerId, issuerName, initial_shares_authorized);
    } else if (chain === "optimism-goerli") {
        return deployCapTableOptimismGoerli(issuerId, issuerName);
    } else {
        throw new Error(`Unsupported chain: ${chain}`);
    }
}
export default deployCapTable;
