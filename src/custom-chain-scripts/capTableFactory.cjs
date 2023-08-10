const { v4: uuid } = require("uuid");
const { localSetup, optimismGoerliSetup } = require("./chainSetup");

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
