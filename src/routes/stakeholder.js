import { Router } from "express";
import { v4 as uuid } from "uuid";
import {
    addWalletToStakeholder,
    convertAndReflectStakeholderOnchain,
    getStakeholderById,
    getStakeholderByWalletAddress,
    getTotalNumberOfStakeholders,
    removeWalletFromStakeholder,
} from "../controllers/stakeholderController.js"; // Importing the controller functions

import stakeholderSchema from "../../ocf/schema/objects/Stakeholder.schema.json" assert { type: "json" };
import { createStakeholder } from "../db/operations/create.js";
import { readIssuerById, readStakeholderByIssuerAssignedId, readStakeholderByIssuerAndIssuerAssignedId } from "../db/operations/read.js";
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
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

stakeholder.get("/issuer_assigned_id/:id", async (req, res) => {
    const { id } = req.params;
    console.log("id", id);

    try {
        const stakeholder = await readStakeholderByIssuerAssignedId(id);

        res.status(200).send(stakeholder);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

stakeholder.get("/issuer/:issuerId/issuer_assigned_id/:id", async (req, res) => {
    console.log("GETTING ISSUER  and ISSUER ASSIGNED ID");
    console.log("req.params", req.params);
    const { id, issuerId } = req.params;
    console.log("id", id);
    console.log("issuer id", issuerId);

    try {
        const stakeholder = await readStakeholderByIssuerAndIssuerAssignedId(issuerId, id);

        res.status(200).send(stakeholder);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

stakeholder.get("/wallet/:address", async (req, res) => {
    const { contract } = req;
    const { address } = req.params;

    try {
        const stakeholder = await getStakeholderByWalletAddress(contract, address);

        res.status(200).send(stakeholder);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

stakeholder.get("/total-number", async (req, res) => {
    const { contract } = req;

    try {
        const totalStakeholders = await getTotalNumberOfStakeholders(contract);
        res.status(200).send(totalStakeholders);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

/// @dev: stakeholder is always created onchain, then to the DB
stakeholder.post("/create", async (req, res) => {
    const { contract } = req;
    const { data, issuerId } = req.body;

    try {
        const issuer = await readIssuerById(issuerId);

        // OCF doesn't allow extra fields in their validation
        const incomingStakeholderToValidate = {
            id: uuid(),
            object_type: "STAKEHOLDER",
            ...data,
        };

        const incomingStakeholderForDB = {
            ...incomingStakeholderToValidate,
            issuer: issuer._id,
        };

        await validateInputAgainstOCF(incomingStakeholderToValidate, stakeholderSchema);

        await convertAndReflectStakeholderOnchain(contract, incomingStakeholderForDB);

        const stakeholder = await createStakeholder(incomingStakeholderForDB);

        console.log("✅ | Stakeholder created offchain:", stakeholder);

        res.status(200).send({ stakeholder });
    } catch (error) {
        console.error(error);
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
        if (error?.data && error?.data?.includes("0x789a109e")) {
            return res.status(200).send("Wallet already added");
        }
        console.error(error);
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
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

export default stakeholder;
