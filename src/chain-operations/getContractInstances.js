import { ethers } from "ethers";
import { config } from "dotenv";
config();

import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
import CAP_TABLE_ISSUANCE from "../../chain/out/StockIssuance.sol/StockIssuanceLib.json" assert { type: "json" };
import CAP_TABLE_TRANSFER from "../../chain/out/StockTransfer.sol/StockTransferLib.json" assert { type: "json" };
import CAP_TABLE_CANCELLATION from "../../chain/out/StockCancellation.sol/StockCancellationLib.json" assert { type: "json" };

const { abi } = CAP_TABLE;
const { abi: abiIssuance } = CAP_TABLE_ISSUANCE;
const { abi: abiTransfer } = CAP_TABLE_TRANSFER;
const { abi: abiCancel } = CAP_TABLE_CANCELLATION;

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
    const contract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, abi, wallet);

    const issuanceLib = new ethers.Contract(contract.target, abiIssuance, wallet);
    const transferLib = new ethers.Contract(contract.target, abiTransfer, wallet);
    const cancellationLib = new ethers.Contract(contract.target, abiCancel, wallet);

    return { contract, provider, issuanceLib, transferLib, cancellationLib };
}

async function getOptimismGoerliContractInstance(address) {
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = address;
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, abi, wallet);

    const issuanceLib = new ethers.Contract(contract.target, abiIssuance, wallet);
    const transferLib = new ethers.Contract(contract.target, abiTransfer, wallet);

    return { contract, provider, issuanceLib, transferLib };
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
