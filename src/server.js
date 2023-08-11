import express, { json, urlencoded } from "express";
import { PrismaClient } from "@prisma/client";
import addNotPoetToDB from "./custom-offchain-scripts/seedNotPoet.js";
import startOnchainListeners from "./custom-chain-scripts/transactionListener.js";

import { ethers, utils } from "ethers";

import { promisify } from "util";
import { exec as originalExec } from "child_process";

import { config } from "dotenv";
config();

const exec = promisify(originalExec);

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

// set up ethers listeners
const CHAIN = "local";
await startOnchainListeners(CHAIN, prisma);

// middlewares
app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(json({ limit: "50mb" }));
app.enable("trust proxy");

app.get("/", async (req, res) => {
    res.send(`Hello World!`);
});

// POC to onboard a cap table via API
// needs to be generalized and importing JSONs needs to be shaped.
app.post("/add-not-poet-to-db", async (req, res) => {
    // TODO: Input validation
    try {
        // Validate and Insert to DB
        const { stdout, stderr } = await exec("yarn validate-not-poet-files");

        console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);

        await addNotPoetToDB(prisma);
        await prisma.$disconnect();

        console.log("Success");
        res.status(200).send("Success");
    } catch (error) {
        console.error(`exec error: ${error}`);
    }
});

app.post("/mint-cap-table", async (req, res) => {
    // TODO: Input validation
    console.log("body ", req.body);

    const { issuerId } = req.body;

    try {
        // get issuer info
        const issuer = await prisma.issuer.findUnique({
            where: {
                id: issuerId,
            },
        });

        if (!issuer) {
            res.status(500).send("Issuer not found");
        }

        console.log("issuer ", issuer);

        const initialSharesAuthorized = issuer.initial_shares_authorized ? issuer.initial_shares_authorized : 0;

        const issuerIdBytes16 = utils.hexlify(utils.arrayify("0x" + issuerId.replace(/-/g, "")));

        console.log("issuer ID bytes32", issuerIdBytes16);

        //mint locally
        //if we do this with a script we can get the deployed to address.
        const forgeCommand = `cd chain && forge create  --via-ir --rpc-url http://127.0.0.1:8545 --private-key ${process.env.PRIVATE_KEY_FAKE_ACCOUNT} src/CapTable.sol:CapTable --constructor-args "${issuerIdBytes16}" "${issuer.legal_name}" "${initialSharesAuthorized}"`;
        console.log("forgeCommand ", forgeCommand);

        const { stdout, stderr } = await exec(forgeCommand, { maxBuffer: 1024 * 1024 * 10 });

        if (stderr) {
            console.log("forge errors ", stderr);
        }

        console.log(`stdout: ${stdout}`);

        // somehow get the address of the contract
        const deployedTo = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

        // update issuer with contract address
        await prisma.issuer.update({
            where: {
                id: issuerId,
            },
            data: {
                comments: [`Cap Table has been deployed to ${deployedTo}`],
            },
        });

        await prisma.$disconnect();

        console.log("success");

        res.status(200).send("Success");
    } catch (error) {
        console.error(`exec error: ${error}`);
    }
});

app.listen(PORT, () => {
    console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
});
