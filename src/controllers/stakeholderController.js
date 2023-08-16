import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import Stakeholder from "../db/objects/Stakeholder.js";

export const getAllStakeholders = async (req, res) => {
    res.send(`Hello stakeholder!`);
};

export const createStakeholder = async (req, res) => {
    const stakeholder = new Stakeholder(req.body);
    try {
        await stakeholder.save();
        console.log("Stakeholder created:", req.body);
        res.status(200).send(stakeholder);
    } catch (error) {
        console.error("Error encountered:", error);
        res.status(500).send(error);
    }
};

export const getStakeholderById = async (req, res) => {
    const { contract } = req;
    const { id } = req.params;
    const stakeholderIdBytes16 = convertUUIDToBytes16(id);
    const stakeHolderAdded = await contract.getStakeholderById(stakeholderIdBytes16);
    const stakeholderId = stakeHolderAdded[0];
    const type = stakeHolderAdded[1];
    const role = stakeHolderAdded[2];
    console.log("Stakeholder:", { stakeholderId, type, role });
    res.status(200).send({ stakeholderId, type, role });
};

export const getTotalNumberOfStakeholders = async (req, res) => {
    const { contract } = req;
    try {
        const totalStakeholders = await contract.getTotalNumberOfStakeholders();
        console.log("Total number of stakeholders:", totalStakeholders.toString());
        res.status(200).send(totalStakeholders.toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
};

export const reflectStakeholderOnchain = async (req, res) => {
    const { contract } = req;
    const { id, stakeholder_type, current_relationship } = req.body; // Extract all three values from the request body
    const stakeholderIdBytes16 = convertUUIDToBytes16(id);

    console.log("stakeholderId", id);
    console.log("stakeholderIdBytes32", stakeholderIdBytes16);

    try {
        const tx = await contract.createStakeholder(stakeholderIdBytes16, stakeholder_type, current_relationship); // Pass all three values
        await tx.wait();

        console.log("Stakeholder created:", { stakeholderIdBytes16, stakeholder_type, current_relationship });
        res.status(200).send(stakeholderIdBytes16);
    } catch (error) {
        console.log("Error encountered:", error);
    }
};
