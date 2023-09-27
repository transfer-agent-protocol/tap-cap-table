import { config } from "dotenv";
import { ethers } from "ethers";
config();

// import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import CAP_TABLE from "../../chain/out/CapTableLibs.sol/CapTableLibs.json" assert { type: "json" };
import CAP_TABLE_ISSUANCE from "../../chain/out/StockIssuance.sol/StockIssuanceLib.json" assert { type: "json" };
import CAP_TABLE_TRANSFER from "../../chain/out/StockTransfer.sol/StockTransferLib.json" assert { type: "json" };

const { abi, bytecode } = CAP_TABLE;
const { abi: abiIssuance, bytecode: bytecodeIssuance } = CAP_TABLE_ISSUANCE;
const { abi: abiTransfer, bytecode: bytecodeTransfer } = CAP_TABLE_TRANSFER;

async function deployCapTableLocal(issuerId, issuerName) {
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
    console.log("issuer id inside of deployment ", issuerId, "and issuername inside of deployment ", issuerName);

    const contract = await factory.deploy(issuerId, issuerName);

    console.log("Contract Deployed to:", contract.target);

    const issuanceLib = new ethers.Contract(contract.target, abiIssuance, wallet);
    const transferLib = new ethers.Contract(contract.target, abiTransfer, wallet);

    return { contract, provider, address: contract.target, issuanceLib, transferLib };
}

async function deployCapTableOptimismGoerli(issuerId, issuerName) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(issuerId, issuerName);

    console.log("Contract Deployed to:", contract.target);

    const issuanceLib = new ethers.Contract(contract.target, abiIssuance, wallet);
    const transferLib = new ethers.Contract(contract.target, abiTransfer, wallet);

    return { contract, provider, address: contract.target, issuanceLib, transferLib };
}

async function deployCapTable(chain, issuerId, issuerName) {
    if (chain === "local") {
        return deployCapTableLocal(issuerId, issuerName);
    } else if (chain === "optimism-goerli") {
        return deployCapTableOptimismGoerli(issuerId, issuerName);
    } else {
        throw new Error(`Unsupported chain: ${chain}`);
    }
}

export default deployCapTable;
