import { Router } from "express";
import { v4 as uuid } from "uuid";
import stockIssuanceSchema from "../../ocf/schema/objects/transactions/issuance/StockIssuance.schema.json" assert { type: "json" };
import stockCancellationSchema from "../../ocf/schema/objects/transactions/cancellation/StockCancellation.schema.json" assert { type: "json" };
import { convertAndCreateIssuanceStockOnchain } from "../controllers/transactions/issuanceController.js";
import { convertAndCreateTransferStockOnchain } from "../controllers/transactions/transferController.js";
import { readIssuerById } from "../db/operations/read.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";
import { convertAndCreateCancallationStockOnchain } from "../controllers/transactions/cancelController.js";

const transactions = Router();

transactions.post("/issuance/stock", async (req, res) => {
    const { contract } = req;
    const { issuerId, data } = req.body;

    try {
        const issuer = await readIssuerById(issuerId);

        const incomingStockIssuance = {
            id: uuid(), // for OCF Validation
            security_id: uuid(), // for OCF Validation
            date: new Date().toISOString().slice(0, 10), // for OCF Validation
            object_type: "TX_STOCK_ISSUANCE",
            ...data,
        };

        await validateInputAgainstOCF(incomingStockIssuance, stockIssuanceSchema);

        await convertAndCreateIssuanceStockOnchain(contract, incomingStockIssuance);

        res.status(200).send({ stockIssuance: incomingStockIssuance });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/transfer/stock", async (req, res) => {
    const { contract } = req;
    const { issuerId, data } = req.body;

    try {
        await readIssuerById(issuerId);

        // @dev: Transfer Validation is not possible through schema because it validates that the transfer has occurred,at this stage it has not yet.

        await convertAndCreateTransferStockOnchain(contract, data);

        res.status(200).send("success");
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/cancel/stock", async (req, res) => {
    const { contract } = req;
    const { issuerId, data } = req.body;

    try {
        await readIssuerById(issuerId);

        const { stakeholderId, stockClassId } = data
        console.log({ data })
        const incomingStockCancellation = {
            id: uuid(),
            security_id: uuid(),
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_CANCELLATION",
            ...data,
        };
        delete incomingStockCancellation.stakeholderId
        delete incomingStockCancellation.stockClassId

        // NOTE: schema validation does not include stakeholder, stockClassId, however these properties are needed on to be passed on chain

        await validateInputAgainstOCF(incomingStockCancellation, stockCancellationSchema);

        await convertAndCreateCancallationStockOnchain(contract, {
            ...incomingStockCancellation,
            stakeholderId, stockClassId
        });

        res.status(200).send({ stockCancellation: incomingStockCancellation });
    } catch (error) {
        console.error(`error: ${error.stack}`);
        res.status(500).send(`${error}`);
    }
});
export default transactions;
