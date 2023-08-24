import { Router } from "express";
import { v4 as uuid } from "uuid";
import valuationSchema from "../../ocf/schema/objects/Valuation.schema.json" assert { type: "json" };
import { createValuation } from "../db/operations/create.js";
import { countValuations, readValuationById } from "../db/operations/read.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

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
        const incomingValuation = {
            id: uuid(),
            object_type: "VALUATION",
            ...req.body,
        };

        await validateInputAgainstOCF(incomingValuation, valuationSchema);
        const valuation = await createValuation(incomingValuation);

        console.log("Created Valuation in DB: ", valuation);

        res.status(200).send({ valuation });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default valuation;
