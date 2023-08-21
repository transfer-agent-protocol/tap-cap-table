import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { createStakeholder } from "../operations/create.js";

export const createAndValidateStakeholder = async (data) => {
    // First: validate the manifest against OCF, for the stakeholder schema
    // TODO

    // Second create Stakeholder in DB
    try {
        const stakeholder = await createStakeholder(data);

        console.log("Stakeholder created:", stakeholder);

        return stakeholder;
    } catch (error) {
        console.error("Error encountered:", error);
    }
};

/// @dev: controller handles conversion from OCF type to Onchain types and creates the stakeholder.
export const convertAndReflectStakeholderOnchain = async (contract, stakeholder) => {
    // First, convert OCF Types to Onchain Types
    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholder._id);

    console.log("Stakeholder ID offchain", stakeholder._id);
    console.log("Stakeholder ID converted to bytes16", stakeholderIdBytes16);

    // Second, create stakeholder onchain
    try {
        const tx = await contract.createStakeholder(stakeholderIdBytes16, stakeholder.stakeholder_type, stakeholder.current_relationship); // Pass all three values
        await tx.wait();

        console.log("Stakeholder created  onchain");
    } catch (error) {
        console.log("Error encountered:", error);
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
