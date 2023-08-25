import { Router } from "express";
import deployCapTable from "../chain-operations/deployCapTable.js";
import seedDB from "../db/scripts/seed.js";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import processManifest from "../utils/processManifest.js";

const router = Router();

router.get("/", async (req, res) => {
    res.send(`Hello world!`);
});

router.post("/mint-cap-table", async (req, res) => {
    try {
        const manifest = await processManifest(req);
        const issuer = await seedDB(manifest);

        const issuerIdBytes16 = convertUUIDToBytes16(issuer._id);
        const deployedTo = await deployCapTable(req.chain, issuerIdBytes16, issuer.legal_name);
        console.log("Minted Cap Table to ", deployedTo);
        res.status(200).send({ address: deployedTo });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send({ error });
    }
});

export default router;
