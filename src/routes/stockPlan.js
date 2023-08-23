import { Router } from "express";
import { v4 as uuid } from "uuid";
import stockPlanSchema from "../../ocf/schema/objects/StockPlan.schema.json" assert { type: "json" };
import { createStockPlan } from "../db/operations/create.js";
import { countStockPlans, readStockPlanById } from "../db/operations/read.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

const stockPlan = Router();

stockPlan.get("/", async (req, res) => {
    res.send(`Hello Stock Plan!`);
});

// @dev, as opposed to objects reflected onchain, the reads in this file  are only from DB
stockPlan.get("/id/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const stockPlan = await readStockPlanById(id);
        res.status(200).send(stockPlan);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

stockPlan.get("/total-number", async (_, res) => {
    try {
        const totalStockPlans = await countStockPlans();
        res.status(200).send(totalStockPlans.toString());
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

/// @dev: stock plan is currently only created offchain
stockPlan.post("/create", async (req, res) => {
    try {
        const incomingStockPlan = {
            id: uuid(),
            object_type: "STOCK_PLAN",
            ...req.body,
        };

        await validateInputAgainstOCF(incomingStockPlan, stockPlanSchema);
        const stockPlan = await createStockPlan(incomingStockPlan);

        console.log("Created Stock Plan in DB: ", stockPlan);

        res.status(200).send({ stockPlan });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default stockPlan;
