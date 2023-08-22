import { Router } from "express";
import { validateAndCreateStockLegend } from "../db/controllers/stockLegendController.js";

import { countStockLegendTemplates, readStockLegendTemplateById } from "../db/operations/read.js";

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
    try {
        const stockLegend = await validateAndCreateStockLegend(req.body);

        res.status(200).send({ stockLegend });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default stockLegend;
