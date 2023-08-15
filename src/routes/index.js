import { Router } from "express";
import { promisify } from "util";
import { exec as originalExec } from "child_process";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import deployCapTable from "../custom-chain-scripts/deployCapTable.js";
import addNotPoetToDB from "../db/scripts/seed.js";
import { readIssuerById } from "../db/operations/read.js";

const exec = promisify(originalExec);

const router = Router();

router.get("/", async (req, res) => {
    res.send(`Hello world!`);
});

// POC to onboard a cap table via API
// needs to be generalized and importing JSONs needs to be shaped.
router.post("/add-not-poet-to-db", async (req, res) => {
    // TODO: Input validation
    try {
        console.log("here");
        // Validate and Insert to DB
        // const { stdout, stderr } = await exec("yarn validate-not-poet-files");

        // console.log(`stdout: ${stdout}`);

        await addNotPoetToDB();

        console.log("Success");
        res.status(200).send("Success");
    } catch (error) {
        console.error(`exec error: ${error}`);
    }
});

router.post("/mint-cap-table", async (req, res) => {
    // TODO: Input validation
    const { chain } = req;
    const { issuerId } = req.body;

    try {
        // get issuer info
        const issuer = await readIssuerById(issuerId);

        if (!issuer) {
            res.status(500).send("Issuer not found");
        }
        console.log("issuer ", issuer);
        const issuerIdBytes16 = convertUUIDToBytes16(issuerId);
        console.log("issuer ID bytes32", issuerIdBytes16);
        const deployedTo = await deployCapTable(chain, issuerIdBytes16, issuer.legal_name);

        console.log("Minted Cap Table to ", deployedTo);
        res.status(200).send(deployedTo);
    } catch (error) {
        console.error(`exec error: ${error}`);
    }
});

export default router;
