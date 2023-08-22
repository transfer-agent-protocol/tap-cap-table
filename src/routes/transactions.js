import { Router } from "express";
import { convertAndCreateIssuanceStockOnchain } from "../db/controllers/transactions/issuanceController.js";
import { convertAndCreateTransferStockOnchain } from "../db/controllers/transactions/transferController.js";

const transactions = Router();

transactions.post("/issuance/stock", async (req, res) => {
    const { contract } = req;

    try {
        await convertAndCreateIssuanceStockOnchain(contract, req.body);

        res.status(200).send("success");
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send({ error });
    }
});

// WIP, not working yet
transactions.post("/transfer/stock", async (req, res) => {
    const { contract } = req;

    try {
        await convertAndCreateTransferStockOnchain(contract, req.body);

        res.status(200).send("success");
    } catch (err) {
        console.error(`error: ${error}`);
        res.status(500).send({ error });
    }
});

export default transactions;
