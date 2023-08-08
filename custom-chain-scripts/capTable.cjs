const { ethers } = require("ethers");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const CAP_TABLE_ABI = require("../chain/out/CapTable.sol/CapTable.json").abi;

async function localSetup() {
    // if deployed using forge script
    //const CONTRACT_ADDRESS_LOCAL = require("../chain/broadcast/CapTable.s.sol/31337/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_LOCAL = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // fill in from capTableFactory

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
    // if deployed using forge script
    // const CONTRACT_ADDRESS_OPTIMISM_GOERLI = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = "0x027A280A63376308658A571ac2DB5D612bA77912";
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    const provider = new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS_OPTIMISM_GOERLI, CAP_TABLE_ABI, wallet);

    return contract;
}


async function createAndDisplayStakeholder(contract) {
    const stakeholderId = uuid();
    try {
        const tx = await contract.createStakeholder(stakeholderId, "INDIVIDUAL", "EMPLOYEE");
        await tx.wait();
    } catch (error) {
        console.log("Error encountered:", error.error.reason);
    }
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderId);
    const id = stakeHolderAdded[0];
    const type = stakeHolderAdded[1];
    const role = stakeHolderAdded[2];
    console.log("New Stakeholder created:", { id, type, role });

    return stakeholderId;
}

async function createAndDisplayStockClass(contract) {
    try {
        const stockClassId = uuid();
        const newStockClass = await contract.createStockClass(stockClassId, "COMMON", 100, 4000000);
        await newStockClass.wait();
        const stockClassAdded = await contract.getStockClassById(stockClassId);
        console.log("--- Stock Class for Existing ID ---");
        console.log("Getting new stock class:");
        console.log("ID:", stockClassAdded[0]);
        console.log("Type:", stockClassAdded[1]);
        console.log("Price Per Share:", ethers.utils.formatUnits(stockClassAdded[2], 6));
        console.log("Initial Shares Authorized:", stockClassAdded[3].toString());

        return stockClassId;
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function totalNumberOfStakeholders(contract) {
    try {
        const totalStakeholders = await contract.getTotalNumberOfStakeholders();
        console.log("Total number of stakeholders:", totalStakeholders.toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function totalNumberOfStockClasses(contract) {
    try {
        const totalStockClasses = await contract.getTotalNumberOfStockClasses();
        console.log("Total number of stock classes:", totalStockClasses.toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
}

async function transferOwnership(contract) {
    const sellerId = "e47a1d5f-91c1-47c5-8f64-edd0fb054f63";
    const buyerId = "593c1fba-7894-48fc-b19c-49304c447d22";
    const stockClassId = "77a2026f-fea4-4530-97e0-8a1ba6681f19";

    try {
        const amountToTransfer = 300000;
        console.log(`transferring ${amountToTransfer} shares`);
        const tx = await contract.transferStockOwnership(sellerId, buyerId, stockClassId, true, amountToTransfer, 123);
        await tx.wait();

        const seller = await contract.getStakeholderById(sellerId);
        const sellerIdFetched = seller[0];
        const sellerType = seller[1];
        const sellerRole = seller[2];

        const buyer = await contract.getStakeholderById(buyerId);
        const buyerIdFetched = buyer[0];
        const buyerType = buyer[1];
        const buyerRole = buyer[2];
        console.log("Ownership transferred successfully!");
        console.log("Seller new values after transfer:", { id: sellerIdFetched, type: sellerType, role: sellerRole });
        console.log("Buyer new values after transfer:", { id: buyerIdFetched, type: buyerType, role: buyerRole });

        const firstTX = await contract.transactions(0);
        const secondTX = await contract.transactions(1);
        const thirdTX = await contract.transactions(2);

        console.log("First issuance transaction address:", firstTX);
        console.log("Second issuance transaction address,", secondTX);
        console.log("Transfer transaction address,", thirdTX);
    } catch (error) {
        console.error("Error encountered for transfer ownership:", error.error.reason);
    }
}

const issuerTest = async (contract) => {
    const issuer = await contract.issuer();
    console.log("Issuer", issuer);
};

const issueStakeholderStock = async (contract, stakeholderId, stockClassId) => {
    const amount = 1000000;
    const sharePrice = 123;

    try {
        const tx = await contract.issueStockByTA(stakeholderId, amount, sharePrice, stockClassId);
        await tx.wait();
        console.log("Issued stock successfully");
    } catch (error) {
        console.error("Error encountered for issuing stock", error);
    }
};

async function main({ chain }) {
    let contract;
    if (chain === "local") {
        contract = await localSetup();
    }

    if (chain === "optimism-goerli") {
        contract = await optimismGoerliSetup();
    }

    //await issuerTest(contract);
    // await displayIssuer(contract);
    //const id = await createAndDisplayStakeholder(contract);
    //const stockClassId = await createAndDisplayStockClass(contract);
    //await issueStakeholderStock(contract, id, stockClassId);
    await transferOwnership(contract);
    // await totalNumberOfStakeholders(contract);
}

const chain = process.argv[2];

console.log("testing process.argv", chain);

main({ chain }).catch(console.error);
