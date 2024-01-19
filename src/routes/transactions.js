import { Router } from "express";
import { v4 as uuid } from "uuid";

import stockAcceptanceSchema from "../../ocf/schema/objects/transactions/acceptance/StockAcceptance.schema.json" assert { type: "json" };
import stockCancellationSchema from "../../ocf/schema/objects/transactions/cancellation/StockCancellation.schema.json" assert { type: "json" };
import stockIssuanceSchema from "../../ocf/schema/objects/transactions/issuance/StockIssuance.schema.json" assert { type: "json" };
import stockReissuanceSchema from "../../ocf/schema/objects/transactions/reissuance/StockReissuance.schema.json" assert { type: "json" };
import stockRepurchaseSchema from "../../ocf/schema/objects/transactions/repurchase/StockRepurchase.schema.json" assert { type: "json" };
import stockRetractionSchema from "../../ocf/schema/objects/transactions/retraction/StockRetraction.schema.json" assert { type: "json" };
import stockClassAuthorizedSharesAdjustmentSchema from "../../ocf/schema/objects/transactions/adjustment/StockClassAuthorizedSharesAdjustment.schema.json" assert { type: "json" };
import issuerAuthorizedSharesAdjustmentSchema from "../../ocf/schema/objects/transactions/adjustment/IssuerAuthorizedSharesAdjustment.schema.json" assert { type: "json" };
import equityCompensationIssuanceSchema from "../../ocf/schema/objects/transactions/issuance/EquityCompensationIssuance.schema.json" assert { type: "json" };
import convertibleIssuanceSchema from "../../ocf/schema/objects/transactions/issuance/ConvertibleIssuance.schema.json" assert { type: "json" };

import { convertAndAdjustIssuerAuthorizedSharesOnChain } from "../controllers/issuerController.js";
import { convertAndAdjustStockClassAuthorizedSharesOnchain } from "../controllers/stockClassController.js";
import { convertAndCreateAcceptanceStockOnchain } from "../controllers/transactions/acceptanceController.js";
import { convertAndCreateCancellationStockOnchain } from "../controllers/transactions/cancellationController.js";
import { convertAndCreateIssuanceStockOnchain } from "../controllers/transactions/issuanceController.js";
import { convertAndCreateReissuanceStockOnchain } from "../controllers/transactions/reissuanceController.js";
import { convertAndCreateRepurchaseStockOnchain } from "../controllers/transactions/repurchaseController.js";
import { convertAndCreateRetractionStockOnchain } from "../controllers/transactions/retractionController.js";
import { convertAndCreateTransferStockOnchain } from "../controllers/transactions/transferController.js";
import { createEquityCompensationIssuance } from "../db/operations/create.js";
import { createConvertibleIssuance } from "../db/operations/create.js";

import { readIssuerById } from "../db/operations/read.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

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

        const { stakeholderId, stockClassId } = data;
        console.log({ data });
        const incomingStockCancellation = {
            id: uuid(),
            security_id: uuid(),
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_CANCELLATION",
            ...data,
        };
        delete incomingStockCancellation.stakeholderId;
        delete incomingStockCancellation.stockClassId;

        // NOTE: schema validation does not include stakeholder, stockClassId, however these properties are needed on to be passed on chain

        await validateInputAgainstOCF(incomingStockCancellation, stockCancellationSchema);

        await convertAndCreateCancellationStockOnchain(contract, {
            ...incomingStockCancellation,
            stakeholderId,
            stockClassId,
        });

        res.status(200).send({ stockCancellation: incomingStockCancellation });
    } catch (error) {
        console.error(`error: ${error.stack}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/retract/stock", async (req, res) => {
    const { contract } = req;
    const { data } = req.body;

    try {
        const { stakeholderId, stockClassId } = data;
        const incomingStockRetraction = {
            id: uuid(), // placeholder
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_RETRACTION",
            ...data,
        };

        delete incomingStockRetraction.stakeholderId;
        delete incomingStockRetraction.stockClassId;

        // NOTE: schema validation does not include stakeholder, stockClassId, however these properties are needed on to be passed on chain
        await validateInputAgainstOCF(incomingStockRetraction, stockRetractionSchema);

        await convertAndCreateRetractionStockOnchain(contract, {
            ...incomingStockRetraction,
            stakeholderId,
            stockClassId,
        });

        res.status(200).send({ stockRetraction: incomingStockRetraction });
    } catch (error) {
        console.error(`error: ${error.stack}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/reissue/stock", async (req, res) => {
    const { contract } = req;
    const { data } = req.body;

    try {
        const { stakeholderId, stockClassId } = data;
        const incomingStockReissuance = {
            id: uuid(), // placeholder
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_REISSUANCE",
            ...data,
        };

        delete incomingStockReissuance.stakeholderId;
        delete incomingStockReissuance.stockClassId;

        // NOTE: schema validation does not include stakeholder, stockClassId, however these properties are needed on to be passed on chain
        await validateInputAgainstOCF(incomingStockReissuance, stockReissuanceSchema);

        await convertAndCreateReissuanceStockOnchain(contract, {
            ...incomingStockReissuance,
            stakeholderId,
            stockClassId,
        });

        res.status(200).send({ stockReissuance: incomingStockReissuance });
    } catch (error) {
        console.error(`error: ${error.stack}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/repurchase/stock", async (req, res) => {
    const { contract } = req;
    const { data } = req.body;

    try {
        const { stakeholderId, stockClassId } = data;
        const incomingStockRepurchase = {
            id: uuid(), // placeholder
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_REPURCHASE",
            ...data,
        };

        delete incomingStockRepurchase.stakeholderId;
        delete incomingStockRepurchase.stockClassId;

        // NOTE: schema validation does not include stakeholder, stockClassId, however these properties are needed on to be passed on chain
        await validateInputAgainstOCF(incomingStockRepurchase, stockRepurchaseSchema);

        await convertAndCreateRepurchaseStockOnchain(contract, {
            ...incomingStockRepurchase,
            stakeholderId,
            stockClassId,
        });

        res.status(200).send({ stockRepurchase: incomingStockRepurchase });
    } catch (error) {
        console.error(`error: ${error.stack}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/accept/stock", async (req, res) => {
    const { contract } = req;
    const { data } = req.body;

    try {
        const { stakeholderId, stockClassId } = data;
        const incomingStockAcceptance = {
            id: uuid(), // placeholder
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_ACCEPTANCE",
            ...data,
        };

        delete incomingStockAcceptance.stakeholderId;
        delete incomingStockAcceptance.stockClassId;

        // NOTE: schema validation does not include stakeholder, stockClassId, however these properties are needed on to be passed on chain
        await validateInputAgainstOCF(incomingStockAcceptance, stockAcceptanceSchema);

        await convertAndCreateAcceptanceStockOnchain(contract, {
            ...incomingStockAcceptance,
            stakeholderId,
            stockClassId,
        });

        res.status(200).send({ stockAcceptance: incomingStockAcceptance });
    } catch (error) {
        console.error(`error: ${error.stack}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/adjust/issuer/authorized-shares", async (req, res) => {
    const { contract } = req;
    const { data } = req.body;

    try {
        // OCF doesn't allow extra fields in their validation
        const issuerAuthorizedSharesAdj = {
            id: uuid(),
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT",
            ...data,
        };

        await validateInputAgainstOCF(issuerAuthorizedSharesAdj, issuerAuthorizedSharesAdjustmentSchema);

        await convertAndAdjustIssuerAuthorizedSharesOnChain(contract, issuerAuthorizedSharesAdj);

        res.status(200).send({ issuerAuthorizedSharesAdj });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/adjust/stock-class/authorized-shares", async (req, res) => {
    const { contract } = req;
    const { data } = req.body;

    try {
        const { stockClassId } = data;
        const stockClassAuthorizedSharesAdjustment = {
            id: uuid(), // placeholder
            date: new Date().toISOString().slice(0, 10),
            object_type: "TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT",
            ...data,
        };

        console.log("stockClassAuthorizedSharesAdjustment", stockClassAuthorizedSharesAdjustment);

        // NOTE: schema validation does not include stakeholder, stockClassId, however these properties are needed on to be passed on chain
        await validateInputAgainstOCF(stockClassAuthorizedSharesAdjustment, stockClassAuthorizedSharesAdjustmentSchema);

        await convertAndAdjustStockClassAuthorizedSharesOnchain(contract, {
            ...stockClassAuthorizedSharesAdjustment,
            stockClassId,
        });

        res.status(200).send({ stockClassAdjustment: stockClassAuthorizedSharesAdjustment });
    } catch (error) {
        console.error(`error: ${error.stack}`);
        res.status(500).send(`${error}`);
    }
});

transactions.post("/issuance/equity-compensation", async (req, res) => {
    const { issuerId, data } = req.body;

    try {
        // ensuring issuer exists
        await readIssuerById(issuerId);

        const incomingEquityCompensationIssuance = {
            id: uuid(), // for OCF Validation
            security_id: uuid(), // for OCF Validation,
            date: new Date().toISOString().slice(0, 10), // for OCF Validation
            object_type: "TX_EQUITY_COMPENSATION_ISSUANCE",
            ...data,
        };
        await validateInputAgainstOCF(incomingEquityCompensationIssuance, equityCompensationIssuanceSchema);

        // save to DB
        const createdIssuance = await createEquityCompensationIssuance(incomingEquityCompensationIssuance);

        res.status(200).send({ equityCompensationIssuance: createdIssuance });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
})


transactions.post("/issuance/convertible", async (req, res) => {
    const { issuerId, data } = req.body;

    try {
        // ensuring issuer exists
        await readIssuerById(issuerId);

        const incomingConvertibleIssuance = {
            id: uuid(), // for OCF Validation
            security_id: uuid(), // for OCF Validation
            date: new Date().toISOString().slice(0, 10), // for OCF Validation
            object_type: "TX_CONVERTIBLE_ISSUANCE",
            ...data,
        };

        console.log('incomingConvertibleIssuance', incomingConvertibleIssuance)
        await validateInputAgainstOCF(incomingConvertibleIssuance, convertibleIssuanceSchema);

        // save to DB
        const createdIssuance = await createConvertibleIssuance(incomingConvertibleIssuance);

        res.status(200).send({ convertibleIssuance: createdIssuance });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
})

export default transactions;
