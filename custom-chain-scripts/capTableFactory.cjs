const { ethers } = require("ethers");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const CAP_TABLE_FACTORY_ABI = require("../chain/out/CapTableFactory.sol/CapTableFactory.json").abi;

async function localSetup() {
    const CONTRACT_ADDRESS_LOCAL = require("../chain/broadcast/CapTableFactory.s.sol/31337/run-latest.json").transactions[0].contractAddress;
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;

    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, CAP_TABLE_FACTORY_ABI, wallet);

    return contract;
}

async function optimismGoerliSetup() {
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = require("../chain/broadcast/CapTableFactory.s.sol/420/run-latest.json").transactions[0].contractAddress;
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, CAP_TABLE_FACTORY_ABI, wallet);

    return contract;
}

async function createCapTable(contract) {
    const issuerId = uuid();
    const legalName = "Null Corp Inc.";
    const initialShares = "1000000";

    console.log("Creating cap table with issuerId:", issuerId, "legalName:", legalName, "initialShares:", initialShares);

    try {
        const tx = await contract.createCapTable(issuerId, legalName, initialShares);
        await tx.wait();

        console.log("Cap Table created!");
    } catch (error) {
        console.log("Error encountered:", error);
    }

    return issuerId;
}

async function getTotalNumberOfCapTables(contract) {
    try {
        console.log("Getting total cap tables...");
        const capTables = await contract.getTotalNumberOfCapTables();
        console.log("Total number of Cap Tables:", capTables.toString());
    } catch (error) {
        console.log("Error encountered getting total cap tables:", error);
    }
}

async function getCapTableAddressById(contract, issuerId) {
    try {
        console.log("Getting total cap tables...");
        const capTableAddress = await contract.getCapTableAddressById(issuerId);
        console.log("Cap Table Address:", capTableAddress);
    } catch (error) {
        console.log("Error encountered getting total cap tables:", error);
    }
}

async function main({ chain }) {
    let contract;
    if (chain === "local") {
        contract = await localSetup();
    }

    if (chain === "optimism-goerli") {
        contract = await optimismGoerliSetup();
    }

    try {
        const issuerId = await createCapTable(contract);
        await getTotalNumberOfCapTables(contract);
        await getCapTableAddressById(contract, issuerId);
    } catch (err) {
        if (err.reason) {
            console.error("Smart contract reverted with reason:", err.reason);
        } else {
            console.error("Error encountered:", err.message);
        }
    }
}

const chain = process.argv[2];

console.log("testing process.argv", chain);

main({ chain }).catch(console.error);
