import { Router } from "express";
import { v4 as uuid } from "uuid";
import stockLegendSchema from "../../ocf/schema/objects/StockLegendTemplate.schema.json" assert { type: "json" };
import { createStockLegendTemplate } from "../db/operations/create.js";
import { countStockLegendTemplates, readStockLegendTemplateById } from "../db/operations/read.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";
import { readIssuerById } from "../db/operations/read.js";

const stockLegend = Router();

stockLegend.get("/", async (req, res) => {
    res.send(`Hello Stock Legend!`);
});

// @dev, as opposed to objects reflected onchain, the reads in this file  are only from DB
stockLegend.get("/id/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const stockLegend = await readStockLegendTemplateById(id);
        res.status(200).send(stockLegend);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

stockLegend.get("/total-number", async (_, res) => {
    try {
        const totalStockLegends = await countStockLegendTemplates();
        res.status(200).send(totalStockLegends.toString());
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

/// @dev: stock legend is currently only created offchain
stockLegend.post("/create", async (req, res) => {
    const { data, issuerId } = req.body;
    try {
        const issuer = await readIssuerById(issuerId);

        const incomingStockLegendToValidate = {
            id: uuid(),
            object_type: "STOCK_LEGEND_TEMPLATE",
            ...data,
        };

        const incomingStockLegendForDB = {
            ...incomingStockLegendToValidate,
            issuer: issuer._id,
        };

        await validateInputAgainstOCF(incomingStockLegendToValidate, stockLegendSchema);
        const stockLegend = await createStockLegendTemplate(incomingStockLegendForDB);

        console.log("✅ | Created Stock Legend in DB: ", stockLegend);

        res.status(200).send({ stockLegend });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default stockLegend;
