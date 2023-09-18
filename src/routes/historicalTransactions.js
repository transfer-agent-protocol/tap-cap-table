import { Router } from "express";
import { readHistoricalTransactionByIssuerId, readIssuerById } from "../db/operations/read.js";

const historicalTransactions = Router();

historicalTransactions.get("/issuer-id/:issuerId", async (req, res) => {
    const { issuerId } = req.params;

    try {
        // checking issuer exists, else return error
        const issuer = await readIssuerById(issuerId);

        const historicalTransactions = await readHistoricalTransactionByIssuerId(issuerId);

        console.log("historicalTransactions", historicalTransactions);

        res.status(200).send(historicalTransactions);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default historicalTransactions;
