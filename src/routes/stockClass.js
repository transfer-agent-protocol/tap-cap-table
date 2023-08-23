import { Router } from "express";
import { v4 as uuid } from "uuid";
import stockClassSchema from "../../ocf/schema/objects/StockClass.schema.json" assert { type: "json" };
import { convertAndReflectStockClassOnchain, getStockClassById, getTotalNumberOfStockClasses } from "../db/controllers/stockClassController.js";
import { createStockClass } from "../db/operations/create.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";

const stockClass = Router();

stockClass.get("/", async (req, res) => {
    res.send(`Hello Stock Class!`);
});

stockClass.get("/id/:id", async (req, res) => {
    const { contract } = req;
    const { id } = req.params;

    try {
        const { stockClassId, classType, pricePerShare, initialSharesAuthorized } = await getStockClassById(contract, id);

        res.status(200).send({ stockClassId, classType, pricePerShare, initialSharesAuthorized });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

stockClass.get("/total-number", async (req, res) => {
    const { contract } = req;
    try {
        const totalStockClasses = await getTotalNumberOfStockClasses(contract);
        res.status(200).send(totalStockClasses);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

/// @dev: stock class is always added to the DB and created onchain in the same function.
// Order to be determined.
stockClass.post("/create", async (req, res) => {
    const { contract } = req;

    try {
        const incomingStockClass = {
            id: uuid(),
            object_type: "STOCK_CLASS",
            ...req.body,
        };
        await validateInputAgainstOCF(incomingStockClass, stockClassSchema);
        await convertAndReflectStockClassOnchain(contract, incomingStockClass);

        const stockClass = await createStockClass(incomingStockClass);

        console.log("Stock Class created offchain:", stockClass);

        res.status(200).send({ stockClass });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default stockClass;
