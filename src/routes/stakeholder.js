import { Router } from "express";
import {
    createAndValidateStakeholder,
    convertAndReflectStakeholderOnchain,
    addWalletToStakeholder,
    removeWalletFromStakeholder,
    getStakeholderById,
    getTotalNumberOfStakeholders,
} from "../db/controllers/stakeholderController.js"; // Importing the controller functions

const stakeholder = Router();

stakeholder.get("/", async (req, res) => {
    res.send(`Hello stakeholder!`);
});

stakeholder.get("/id/:id", async (req, res) => {
    try {
        const { contract } = req;
        const { id } = req.params;

        const { stakeholderId, type, role } = await getStakeholderById(contract, id);

        res.status(200).send({ stakeholderId, type, role });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

stakeholder.get("/total-number", async (req, res) => {
    try {
        const { contract } = req;
        const totalStakeholders = await getTotalNumberOfStakeholders(contract);
        res.status(200).send(totalStakeholders);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

/// @dev: stakeholder is always added to the DB and created onchain in the same function.
// Order to be determined.
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
        res.status(500).send(`${error}`);
    }
});

stakeholder.post("/add-wallet", async (req, res) => {
    const { contract } = req;
    const { id, wallet } = req.body;
    try {
        await addWalletToStakeholder(contract, id, wallet);
        res.status(200).send("Success");
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

stakeholder.post("/remove-wallet", async (req, res) => {
    const { contract } = req;
    const { id, wallet } = req.body;
    try {
        await removeWalletFromStakeholder(contract, id, wallet);
        res.status(200).send("Success");
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default stakeholder;
