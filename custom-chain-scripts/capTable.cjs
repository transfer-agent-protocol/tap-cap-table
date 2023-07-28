const { ethers } = require("ethers");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const CAP_TABLE_ABI = require("../chain/out/CapTable.sol/CapTable.json").abi;

async function localSetup() {
    const CONTRACT_ADDRESS_LOCAL = require("../chain/broadcast/CapTable.s.sol/31337/run-latest.json").transactions[0].contractAddress;
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;

    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, CAP_TABLE_ABI, wallet);

    return contract;
}

async function optimismGoerliSetup() {
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, CAP_TABLE_ABI, wallet);

    return contract;
}

async function updateLegalName(contract) {
    const tx = await contract.updateLegalName("Poetic Justice");
    await tx.wait();
    console.log("Legal name updated successfully!");
}

async function displayIssuer(contract) {
    const newIssuer = await contract.getIssuer();
    console.log("New issuer with name:", newIssuer);
}

async function createAndDisplayStakeholder(contract) {
    const stakeholderId = uuid();
    try {
        const tx = await contract.createStakeholder(stakeholderId);
        await tx.wait();
    } catch (error) {
        console.log("Error encountered:", error.error.reason);
    }
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderId);
    console.log("Stakeholder for Existing ID:", stakeHolderAdded);
}

async function displayNonExistingStakeholder(contract) {
    const nonExistingStakeholder = await contract.getStakeholderById("222-222-222");
    console.log("Stakeholder for Non-Existing ID:", nonExistingStakeholder);
}

async function createAndDisplayStockClass(contract) {
    const stockClassId = uuid();
    const newStockClass = await contract.createStockClass(stockClassId, "COMMON", 100, 100, 4000000);
    await newStockClass.wait();
    const stockClassAdded = await contract.getStockClassById(stockClassId);
    console.log("--- Stock Class for Existing ID ---");
    console.log("Getting new stock class:");
    console.log("ID:", stockClassAdded[0]);
    console.log("Type:", stockClassAdded[1]);
    console.log("Price Per Share:", ethers.utils.formatUnits(stockClassAdded[2], 6));
    console.log("Par Value:", ethers.utils.formatUnits(stockClassAdded[3], 6));
    console.log("Initial Shares Authorized:", stockClassAdded[4].toString());
}

async function displayNonExistingStockClass(contract) {
    const nonExistingStockClass = await contract.getStockClassById("222-222-222");
    console.log("--- Stock Class for Non-Existing ID ---");
    console.log("Getting new stock class:");
    console.log("ID:", nonExistingStockClass[0]);
    console.log("Type:", nonExistingStockClass[1]);
    console.log("Price Per Share:", ethers.utils.formatUnits(nonExistingStockClass[2], 6));
    console.log("Par Value:", ethers.utils.formatUnits(nonExistingStockClass[3], 6));
    console.log("Initial Shares Authorized:", nonExistingStockClass[4].toString());
}

async function totalNumberOfStakeholders(contract) {
    const totalStakeholders = await contract.getTotalNumberOfStakeholders();
    console.log("Total number of stakeholders:", totalStakeholders.toString());
}

async function totalNumberOfStockClasses(contract) {
    const totalStockClasses = await contract.getTotalNumberOfStockClasses();
    console.log("Total number of stock classes:", totalStockClasses.toString());
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
        await updateLegalName(contract);
        await displayIssuer(contract);
        await createAndDisplayStakeholder(contract);
        await displayNonExistingStakeholder(contract);
        await createAndDisplayStockClass(contract);
        await displayNonExistingStockClass(contract);
        await totalNumberOfStakeholders(contract);
        await totalNumberOfStockClasses(contract);
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
