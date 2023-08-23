import { Router } from "express";
import { v4 as uuid } from "uuid";
import stockIssuanceSchema from "../../ocf/schema/objects/transactions/issuance/StockIssuance.schema.json" assert { type: "json" };
import { convertAndCreateIssuanceStockOnchain } from "../db/controllers/transactions/issuanceController.js";
import { convertAndCreateTransferStockOnchain } from "../db/controllers/transactions/transferController.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

const transactions = Router();

transactions.post("/issuance/stock", async (req, res) => {
    const { contract } = req;

    try {
        const incomingStockIssuance = {
            id: uuid(),
            security_id: uuid(),
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_ISSUANCE",
            ...req.body,
        };

        await validateInputAgainstOCF(incomingStockIssuance, stockIssuanceSchema);

        await convertAndCreateIssuanceStockOnchain(contract, incomingStockIssuance);

        res.status(200).send({ stockIssuance: incomingStockIssuance });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

// WIP, not working yet
transactions.post("/transfer/stock", async (req, res) => {
    const { contract } = req;

    try {
        await convertAndCreateTransferStockOnchain(contract, req.body);

        res.status(200).send("success");
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default transactions;
