import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
    addWalletToStakeholder,
    convertAndReflectStakeholderOnchain,
    getStakeholderById,
    getTotalNumberOfStakeholders,
    removeWalletFromStakeholder,
} from "../db/controllers/stakeholderController.js"; // Importing the controller functions

import stakeholderSchema from "../../ocf/schema/objects/Stakeholder.schema.json" assert { type: "json" };
import { createStakeholder } from "../db/operations/create.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

const stakeholder = Router();

stakeholder.get("/", async (req, res) => {
    res.send(`Hello stakeholder!`);
});

stakeholder.get("/id/:id", async (req, res) => {
    const { contract } = req;
    const { id } = req.params;

    try {
        const { stakeholderId, type, role } = await getStakeholderById(contract, id);

        res.status(200).send({ stakeholderId, type, role });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

stakeholder.get("/total-number", async (req, res) => {
    const { contract } = req;

    try {
        const totalStakeholders = await getTotalNumberOfStakeholders(contract);
        res.status(200).send(totalStakeholders);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

/// @dev: stakeholder is always created onchain, then to the DB
stakeholder.post("/create", async (req, res) => {
    const { contract } = req;

    try {
        const incomingStakeholder = {
            id: uuid(),
            object_type: "STAKEHOLDER",
            ...req.body,
        };

        await validateInputAgainstOCF(incomingStakeholder, stakeholderSchema);

        await convertAndReflectStakeholderOnchain(contract, incomingStakeholder);

        const stakeholder = await createStakeholder(incomingStakeholder);

        console.log("Stakeholder created offchain:", stakeholder);

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
