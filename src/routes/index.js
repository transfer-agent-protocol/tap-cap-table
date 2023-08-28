import { Router } from "express";
import { promisify } from "util";
import { exec as originalExec } from "child_process";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import deployCapTable from "../chain-operations/deployCapTable.js";
import addNotPoetToDB from "../db/scripts/seed.js";

const exec = promisify(originalExec);

const router = Router();

router.get("/", async (req, res) => {
    res.send(`Hello world!`);
});

/// @dev: POC to onboard a cap table via manifest and API
// this is hardcoded for Poet's manifest files living in /db/samples, will need to be extended.
router.post("/mint-cap-table", async (req, res) => {
    const { chain } = req;
    // First: validate the manifest against OCF

    // since this example is hardcoded, it's not coming from the body. otherwise
    // const { manifest } = req.body;
    // then, validate it against OCF schema

    // TODO: There's an error validating from OCF. It's tracked in Linear
    // const { stdout, stderr } = await exec("yarn validate-poet-files");
    // console.log(`stdout: ${stdout}`);

    try {
        // Second: send manifest to seed script
        const issuer = await addNotPoetToDB();

        console.log("Success adding manifest to DB, issuer: ", issuer);

        // Third: convert required fields from OCF standard to Onchain types
        const issuerIdBytes16 = convertUUIDToBytes16(issuer._id);

        // Fourth: mint the cap table. Right now, we're only minting the issuer, not adding stakeholders, stockclasses, etc.
        const deployedTo = await deployCapTable(chain, issuerIdBytes16, issuer.legal_name);

        console.log("Minted Cap Table to ", deployedTo);

        // TODO:Fifth: update contract with Stakeholders, Stockclasses, Transactions, etc.

        res.status(200).send({ issuer });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send({ error });
    }
});

export default router;
