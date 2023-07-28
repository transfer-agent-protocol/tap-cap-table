const { ethers } = require("ethers");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const CAP_TABLE_ABI = require("../chain/out/CapTable.sol/CapTable.json").abi;
const CONTRACT_ADDRESS = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CAP_TABLE_ABI, wallet);

async function updateLegalName() {
    const tx = await contract.updateLegalName("Poetic Justice Inc.");
    await tx.wait();
    console.log("Legal name updated successfully!");
}

async function displayIssuer() {
    const newIssuer = await contract.getIssuer();
    console.log("New issuer with name:", newIssuer);
}

async function createAndDisplayStakeholder() {
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

async function displayNonExistingStakeholder() {
    const nonExistingStakeholder = await contract.getStakeholderById("222-222-222");
    console.log("Stakeholder for Non-Existing ID:", nonExistingStakeholder);
}

async function createAndDisplayStockClass() {
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

async function displayNonExistingStockClass() {
    const nonExistingStockClass = await contract.getStockClassById("222-222-222");
    console.log("--- Stock Class for Non-Existing ID ---");
    console.log("Getting new stock class:");
    console.log("ID:", nonExistingStockClass[0]);
    console.log("Type:", nonExistingStockClass[1]);
    console.log("Price Per Share:", ethers.utils.formatUnits(nonExistingStockClass[2], 6));
    console.log("Par Value:", ethers.utils.formatUnits(nonExistingStockClass[3], 6));
    console.log("Initial Shares Authorized:", nonExistingStockClass[4].toString());
}

async function totalNumberOfStakeholders() {
    const totalStakeholders = await contract.getTotalNumberOfStakeholders();
    console.log("Total number of stakeholders:", totalStakeholders.toString());
}

async function totalNumberOfStockClasses() {
    const totalStockClasses = await contract.getTotalNumberOfStockClasses();
    console.log("Total number of stock classes:", totalStockClasses.toString());
}

async function main() {
    try {
        await updateLegalName();
        await displayIssuer();
        await createAndDisplayStakeholder();
        await displayNonExistingStakeholder();
        await createAndDisplayStockClass();
        await displayNonExistingStockClass();
        await totalNumberOfStakeholders();
        await totalNumberOfStockClasses();
    } catch (err) {
        if (err.reason) {
            console.error("Smart contract reverted with reason:", err.reason);
        } else {
            console.error("Error encountered:", err.message);
        }
    }
}

main().catch(console.error);
