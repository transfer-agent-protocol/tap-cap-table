const { v4: uuid } = require("uuid");

const { localSetup, optimismGoerliSetup } = require("./chainSetup");

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

async function transferOwnership(contract, transferorId, transfereeId, stockClassId) {
    try {
        const amountToTransfer = 300000;
        console.log(`transferring ${amountToTransfer} shares`);
        const tx = await contract.transferStockOwnership(transferorId, transfereeId, stockClassId, true, amountToTransfer, 123);
        await tx.wait();

        console.log("transfer was successfull");

        const seller = await contract.getStakeholderById(transferorId);
        const sellerIdFetched = seller[0];
        const sellerType = seller[1];
        const sellerRole = seller[2];

        const buyer = await contract.getStakeholderById(transfereeId);
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

    const transferorId = "b5f5394e-cb6f-4ea9-a1c0-983777680e86";
    const transfereeId = "7ee7b19a-ff37-4a17-982c-822785711329";
    //const stockClassId = "4ff26d92-b2c2-4657-b756-6ea5598881fd";

    //await issuerTest(contract);
    // await displayIssuer(contract);
    const id = await createAndDisplayStakeholder(contract);
    const stockClassId = await createAndDisplayStockClass(contract);
    await issueStakeholderStock(contract, id, stockClassId);
    // await transferOwnership(contract, transferorId, transfereeId, stockClassId);
    // await totalNumberOfStakeholders(contract);
}

const chain = process.argv[2];

console.log("testing process.argv", chain);

main({ chain }).catch(console.error);
