import { config } from "dotenv";
import { ethers } from "ethers";
config();

import axios from "axios";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
const { abi, bytecode } = CAP_TABLE;

async function deployCapTableLocal(issuerId, issuerName) {
    // Replace with your private key and provider endpoint
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(issuerId, issuerName);

    console.log("Waiting for contract to be mined...");
    await contract.deployed();
    console.log("Contract mined!");

    return contract.address;
}

async function deployCapTableOptimismGoerli(issuerId, issuerName) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const providerEtherscan = new ethers.providers.EtherscanProvider("optimism-goerli", process.env.ETHERSCAN_OPTIMISM_API_KEY);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(issuerId, issuerName);

    console.log("Waiting for contract to be mined...");
    await contract.deployed();
    console.log("Contract mined!");

    return contract.address;
}

const chainUrlMapper = (chain) => {
    if (chain === "optimism-goerli") return "https://api.goerli-optimism.etherscan.io/api";
};

// Scaffold code to verify contracts programmatically, WIP and not used at the moment.
async function verifyContractOnEtherscan(chain, address) {
    const apiKey = process.env.ETHERSCAN_OPTIMISM_API_KEY;
    const contractAddress = address;
    const sourceCode = fs.readFileSync("path_to_flattened_contract.sol", "utf8");
    const contractName = "CapTable";
    const compilerVersion = "v0.8.20";
    const optimizationUsed = 1; // 0 for no, 1 for yes
    const runs = 200; // This is the default
    const constructorArguments = ""; // If your contract has constructor arguments, they need to be ABI-encoded and provided here.

    const apiUrl = chainUrlMapper(chain);

    const response = await axios.post(apiUrl, {
        apikey: apiKey,
        module: "contract",
        action: "verifysourcecode",
        contractaddress: contractAddress,
        sourceCode: sourceCode,
        contractname: contractName,
        compilerversion: compilerVersion,
        optimizationUsed: optimizationUsed,
        runs: runs,
        constructorArguements: constructorArguments,
    });

    console.log("response", response);
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
