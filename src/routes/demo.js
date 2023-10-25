
import { Router } from "express";
import { v4 as uuid } from "uuid";

import issuerSchema from "../../ocf/schema/objects/Issuer.schema.json" assert { type: "json" };
import { deployDemoCapTableOptimismGoerli } from "../chain-operations/deployCapTable.js";
import { createIssuer } from "../db/operations/create.js";
import { countIssuers, readIssuerById } from "../db/operations/read.js";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

import { contractCache } from "../utils/caches.js";
import startOnchainListeners from "../chain-operations/transactionListener.js";

const demo = Router();


demo.post("/issuer/create", async (req, res) => {
    try {
        // OCF doesn't allow extra fields in their validation
        const { initial_shares_authorized } = req.body
        const incomingIssuerToValidate = {
            id: uuid(),
            object_type: "ISSUER",
            ...req.body,
        };

        console.log("⏳ | Issuer to validate", incomingIssuerToValidate);

        await validateInputAgainstOCF(incomingIssuerToValidate, issuerSchema);

        const issuerIdBytes16 = convertUUIDToBytes16(incomingIssuerToValidate.id);
        console.log("💾 | Issuer id in bytes16 ", issuerIdBytes16);
        const { contract, provider, address, libraries } = await deployDemoCapTableOptimismGoerli(
            issuerIdBytes16,
            incomingIssuerToValidate.legal_name,
            initial_shares_authorized
        );

        // add contract to the cache and start listener
        contractCache[incomingIssuerToValidate.id] = { contract, provider, libraries };
        startOnchainListeners(contract, provider, incomingIssuerToValidate.id, libraries);

        const incomingIssuerForDB = {
            ...incomingIssuerToValidate,
            deployed_to: address,
        };

        const issuer = await createIssuer(incomingIssuerForDB);

        console.log("✅ | Issuer created offchain:", issuer);

        res.status(200).send({ issuer });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(400).send({error: error.message});
    }
});

export default demo;
