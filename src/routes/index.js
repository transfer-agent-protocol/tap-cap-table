import { Router } from "express";
import deployCapTable from "../chain-operations/deployCapTable.js";
import seedDB from "../db/scripts/seed.js";
import { contractCache } from "../utils/caches.js";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import processManifest from "../utils/processManifest.js";
import { updateIssuerById } from "../db/operations/update.js";
import startOnchainListeners from "../chain-operations/transactionListener.js";

const router = Router();

router.get("/", async (req, res) => {
    res.send(`Hello world!`);
});

router.post("/mint-cap-table", async (req, res) => {
    try {
        const manifest = await processManifest(req);

        const issuer = await seedDB(manifest);

        const issuerIdBytes16 = convertUUIDToBytes16(issuer._id);
        const { contract, provider, address } = await deployCapTable(req.chain, issuerIdBytes16, issuer.legal_name);
        console.log("Minted Cap Table to ", address);

        const savedIssuerWithDeployedTo = await updateIssuerById(issuer._id, { deployed_to: address });

        // add contract to the cache and start listener
        contractCache[issuer._id] = { contract, provider };
        startOnchainListeners(contract, provider, issuer._id);

        res.status(200).send({ issuer: savedIssuerWithDeployedTo });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send({ error });
    }
});

export default router;
