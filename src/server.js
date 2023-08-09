import express from "express";
import { PrismaClient } from "@prisma/client";
import addNotPoetToDB from "./custom-offchain-scripts/seedNotPoet.js";
import { exec } from "child_process";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
    res.send(`Hello World!`);
});

app.get("/add-not-poet", async (req, res) => {
    exec("yarn validate-not-poet-files", async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);

        await addNotPoetToDB(prisma);

        console.log("Success");

        res.send("success");
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
 

// await prisma.$disconnect()