import express from "express";
import { PrismaClient } from "@prisma/client";
import addNotPoetToDB from "./custom-offchain-scripts/seedNotPoet.js";
import { exec } from "child_process";
import startOnchainListeners from "./custom-chain-scripts/transactionListener.js";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

// set up ethers listeners
const CHAIN = "local";
await startOnchainListeners(CHAIN, prisma);

app.get("/", async (req, res) => {
    res.send(`Hello World!`);
});

// POC to onboard a cap table via API
// needs to be generalized and importing JSONs needs to be shaped.
app.get("/add-not-poet", async (req, res) => {
    exec("yarn validate-not-poet-files", async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);

        await addNotPoetToDB(prisma);
        await prisma.$disconnect();

        console.log("Success");

        res.send("success");
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
 
