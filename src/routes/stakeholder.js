import { Router } from "express";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";

const stakeholder = Router();

stakeholder.get("/", async (req, res) => {
    res.send(`Hello stakeholder!`);
});

// Onchain routes
stakeholder.get("/onchain/:id", async (req, res) => {
    const { contract } = req;
    const { id } = req.params;

    const stakeholderIdBytes16 = convertUUIDToBytes16(id);
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderIdBytes16);
    const stakeholderId = stakeHolderAdded[0];
    const type = stakeHolderAdded[1];
    const role = stakeHolderAdded[2];
    console.log("New Stakeholder created:", { stakeholderId, type, role });

    res.status(200).send({ stakeholderId, type, role });
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
    } catch (error) {
        console.log("Error encountered:", error);
    }

    res.status(200).send(stakeholderIdBytes16);
});

// Offchain routes
stakeholder.post("/create", async (req, res) => {});

export default stakeholder;
