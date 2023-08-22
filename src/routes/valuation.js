import { Router } from "express";
import { validateAndCreateValuation } from "../db/controllers/valuationController.js";
import { countValuations, readValuationById } from "../db/operations/read.js";

const valuation = Router();

valuation.get("/", async (req, res) => {
    res.send(`Hello Valuation!`);
});

valuation.get("/id/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const valuation = await readValuationById(id);
        res.status(200).send(valuation);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

valuation.get("/total-number", async (_, res) => {
    try {
        const totalValuations = await countValuations();
        res.status(200).send(totalValuations.toString());
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

valuation.post("/create", async (req, res) => {
    try {
        const valuation = await validateAndCreateValuation(req.body);

        res.status(200).send({ valuation });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default valuation;
