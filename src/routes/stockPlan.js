import { Router } from "express";
import { validateStockPlan } from "../db/controllers/stockPlanController.js";
import { countStockPlans, readStockPlanById } from "../db/operations/read.js";
import { createStockPlan } from "../db/operations/create.js";

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
        await validateStockPlan(req.body);
        const stockPlan = await createStockPlan(req.body);

        res.status(200).send({ stockPlan });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default stockPlan;
