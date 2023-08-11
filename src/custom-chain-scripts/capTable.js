import { localSetup, optimismGoerliSetup } from "./chainSetup.js";
import { v4 as uuid } from "uuid";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";

async function createAndDisplayStakeholder(contract) {
    const stakeholderId = uuid();
    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholderId);

    console.log("stakeholderId ", stakeholderId);
    console.log("stakeholderIdBytes32", stakeholderIdBytes16);

    try {
        const tx = await contract.write.createStakeholder(stakeholderIdBytes16, "INDIVIDUAL", "EMPLOYEE");
        await tx.wait();
    } catch (error) {
        console.log("Error encountered:", error);
    }
    const stakeHolderAdded = await contract.read.getStakeholderById(stakeholderIdBytes16);
    const id = stakeHolderAdded[0];
    const type = stakeHolderAdded[1];
    const role = stakeHolderAdded[2];
    console.log("New Stakeholder created:", { id, type, role });

    return stakeholderIdBytes16;
}

const issuerTest = async (contract) => {
    const issuer = await contract.read.issuer();
    console.log("Issuer", issuer);
};

async function main({ chain }) {
    let _contract;
    let _provider;
    if (chain === "local") {
        const { contract, provider } = await localSetup();
        _contract = contract;
        _provider = provider;
    }

    if (chain === "optimism-goerli") {
        const { contract, provider } = await optimismGoerliSetup();
        _contract = contract;
        _provider = provider;
    }
    const transferorId = "0x1636c898717741fbaa72f735622cad35";
    const transfereeId = "0xb3174fbc904c495585690a1002351ee3";
    //const stockClassId = "0xe6a02695fdf7479bb2e1a362e9cdfc69";

    await issuerTest(_contract);
    // await displayIssuer(contract);
    // const id = await createAndDisplayStakeholder(_contract);
    //const stockClassId = await createAndDisplayStockClass(_contract);
    //await issueStakeholderStock(_contract, id, stockClassId);
    //await transferOwnership(_contract, transferorId, transfereeId, stockClassId);
    // await totalNumberOfStakeholders(contract);
}

const chain = process.argv[2];

console.log("testing process.argv", chain);

main({ chain });
