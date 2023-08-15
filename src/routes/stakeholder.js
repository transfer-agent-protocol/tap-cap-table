import { Router } from "express";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";

const stakeholder = Router();

stakeholder.get("/", async (req, res) => {
    res.send(`Hello stakeholder!`);
});

// Onchain routes
stakeholder.get("/onchain/id/:id", async (req, res) => {
    const { contract } = req;
    const { id } = req.params;

    const stakeholderIdBytes16 = convertUUIDToBytes16(id);
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderIdBytes16);
    const stakeholderId = stakeHolderAdded[0];
    const type = stakeHolderAdded[1];
    const role = stakeHolderAdded[2];
    console.log("Stakeholder:", { stakeholderId, type, role });

    res.status(200).send({ stakeholderId, type, role });
});

stakeholder.get("/onchain/total-number", async (req, res) => {
    const { contract } = req;
    try {
        const totalStakeholders = await contract.getTotalNumberOfStakeholders();
        console.log("Total number of  stakeholders:", totalStakeholders.toString());

        res.status(200).send(totalStakeholders.toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
});

stakeholder.post("/onchain/reflect", async (req, res) => {
    const { contract } = req;
    const { id, stakeholder_type, current_relationship } = req.body;

    const stakeholderIdBytes16 = convertUUIDToBytes16(id);
    console.log("stakeholderId ", id);
    console.log("stakeholderIdBytes32", stakeholderIdBytes16);

    try {
        const tx = await contract.createStakeholder(stakeholderIdBytes16, stakeholder_type, current_relationship);
        await tx.wait();

        console.log("Stakeholder created:", { stakeholderIdBytes16, stakeholder_type, current_relationship });
    } catch (error) {
        console.log("Error encountered:", error);
    }

    res.status(200).send(stakeholderIdBytes16);
});

// Offchain routes
stakeholder.post("/create", async (req, res) => {});

export default stakeholder;
