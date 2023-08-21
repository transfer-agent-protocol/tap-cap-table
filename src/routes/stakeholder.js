import { Router } from "express";
import {
    createAndValidateStakeholder,
    convertAndReflectStakeholderOnchain,
    getStakeholderById,
    getTotalNumberOfStakeholders,
} from "../db/controllers/stakeholderController.js"; // Importing the controller functions

const stakeholder = Router();

stakeholder.get("/", async (req, res) => {
    res.send(`Hello stakeholder!`);
});

stakeholder.get("/onchain/id/:id", getStakeholderById);
stakeholder.get("/onchain/total-number", getTotalNumberOfStakeholders);

stakeholder.post("/create", async (req, res) => {
    const { contract } = req;
    const { name, issuer_assigned_id, stakeholder_type, current_relationship, primary_contact, contact_info, comments } = req.body;
    try {
        // importing req.body as a short cut, will need to import specific fields
        const stakeholder = await createAndValidateStakeholder({
            name,
            issuer_assigned_id,
            stakeholder_type,
            current_relationship,
            primary_contact,
            contact_info,
            comments,
        });

        await convertAndReflectStakeholderOnchain(contract, stakeholder);
        res.status(200).send({ stakeholder });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send({ error });
    }
});

export default stakeholder;
