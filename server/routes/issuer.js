import { Router } from "express";
import { v4 as uuid } from "uuid";

import issuerSchema from "../../ocf/schema/objects/Issuer.schema.json" with { type: "json" };
import deployCapTable from "../chain-operations/deployCapTable.js";
import { createIssuer } from "../db/operations/create.js";
import { countIssuers, readIssuerById } from "../db/operations/read.js";
import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

const issuer = Router();

issuer.get("/", async (req, res) => {
    res.send(`Hello issuer!`);
});

//WIP get routes are currently fetching offchain.
issuer.get("/id/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { issuerId, type, role } = await readIssuerById(id);

        res.status(200).send({ issuerId, type, role });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

issuer.get("/total-number", async (req, res) => {
    try {
        const totalIssuers = await countIssuers();
        res.status(200).send(totalIssuers);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

issuer.post("/create", async (req, res) => {
    try {
        // OCF doesn't allow extra fields in their validation
        const incomingIssuerToValidate = {
            id: uuid(),
            object_type: "ISSUER",
            ...req.body,
        };

        console.log("⏳ | Issuer to validate", incomingIssuerToValidate);

        await validateInputAgainstOCF(incomingIssuerToValidate, issuerSchema);

        const issuerIdBytes16 = convertUUIDToBytes16(incomingIssuerToValidate.id);
        console.log("💾 | Issuer id in bytes16 ", issuerIdBytes16);
        const { address, deployHash } = await deployCapTable(
            issuerIdBytes16,
            incomingIssuerToValidate.legal_name,
            incomingIssuerToValidate.initial_shares_authorized
        );

        const incomingIssuerForDB = {
            ...incomingIssuerToValidate,
            deployed_to: address,
            tx_hash: deployHash,
        };

        const issuer = await createIssuer(incomingIssuerForDB);

        console.log("✅ | Issuer created offchain:", issuer);

        res.status(200).send({ issuer });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

// Register an externally-deployed cap table (e.g. from the frontend wallet flow)
issuer.post("/register", async (req, res) => {
    try {
        const { id: bytes16Id, deployed_to, tx_hash, ...ocfFields } = req.body;

        if (!deployed_to || !tx_hash) {
            return res.status(400).send("deployed_to and tx_hash are required");
        }

        // Use the same ID that was sent to the contract (bytes16 → UUID)
        // so the event poller can match the IssuerCreated event to this DB record.
        // Falls back to a random UUID for backwards compatibility.
        const issuerId = bytes16Id ? convertBytes16ToUUID(bytes16Id) : uuid();

        const incomingIssuerToValidate = {
            id: issuerId,
            object_type: "ISSUER",
            ...ocfFields,
        };

        console.log("⏳ | Issuer to validate (register)", incomingIssuerToValidate);

        await validateInputAgainstOCF(incomingIssuerToValidate, issuerSchema);

        const incomingIssuerForDB = {
            ...incomingIssuerToValidate,
            deployed_to,
            tx_hash,
        };

        const issuerRecord = await createIssuer(incomingIssuerForDB);

        console.log("✅ | Issuer registered offchain:", issuerRecord);

        res.status(200).send({ issuer: issuerRecord });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

export default issuer;
