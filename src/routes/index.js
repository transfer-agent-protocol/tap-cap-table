import { Router } from "express";
import deployCapTable from "../chain-operations/deployCapTable.js";
import { updateIssuerById } from "../db/operations/update.js";
import seedDB from "../db/scripts/seed.js";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import processManifest from "../utils/processManifest.js";

const router = Router();


router.post("/mint-cap-table", async (req, res) => {
    try {
        const manifest = await processManifest(req);

        const issuer = await seedDB(manifest);

        const issuerIdBytes16 = convertUUIDToBytes16(issuer._id);
        const { address } = await deployCapTable(req.chain, issuerIdBytes16, issuer.legal_name, issuer.initial_shares_authorized);
        const savedIssuerWithDeployedTo = await updateIssuerById(issuer._id, { deployed_to: address });
        res.status(200).send({ issuer: savedIssuerWithDeployedTo });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send({ error });
    }
});

export default router;
