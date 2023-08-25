import { Router } from "express";
import { v4 as uuid } from "uuid";

import issuerSchema from "../../ocf/schema/objects/Issuer.schema.json" assert { type: "json" };
import deployCapTable from "../chain-operations/deployCapTable.js";
import { createIssuer } from "../db/operations/create.js";
import { countIssuers, readIssuerById } from "../db/operations/read.js";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

const issuer = Router();

issuer.get("/", async (req, res) => {
    res.send(`Hello issuer!`);
});

//WIP get routes are currently fetching offchain.
issuer.get("/id/:id", async (req, res) => {
    const { contract } = req;
    const { id } = req.params;

    try {
        const { issuerId, type, role } = await readIssuerById(contract, id);

        res.status(200).send({ issuerId, type, role });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

issuer.get("/total-number", async (req, res) => {
    const { contract } = req;

    try {
        const totalIssuers = await countIssuers(contract);
        res.status(200).send(totalIssuers);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

/// @dev: TODO: Issuer does not have confirmation flag on the DB because it's used  to seed
issuer.post("/create", async (req, res) => {
    const { chain } = req;

    try {
        // OCF doesn't allow extra fields in their validation
        const incomingIssuerToValidate = {
            id: uuid(),
            object_type: "ISSUER",
            ...req.body,
        };

        console.log("issuer to validate", incomingIssuerToValidate);

        await validateInputAgainstOCF(incomingIssuerToValidate, issuerSchema);

        const issuerIdBytes16 = convertUUIDToBytes16(incomingIssuerToValidate.id);
        const deployedTo = await deployCapTable(chain, issuerIdBytes16, incomingIssuerToValidate.legal_name);

        const issuer = await createIssuer(incomingIssuerToValidate);

        console.log("Issuer created offchain:", issuer);

        res.status(200).send({ to: deployedTo });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default issuer;
