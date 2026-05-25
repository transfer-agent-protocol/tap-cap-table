import { Router } from "express";
import { v4 as uuid } from "uuid";
import stockClassSchema from "../../ocf/schema/objects/StockClass.schema.json" with { type: "json" };
import { convertAndReflectStockClassOnchain, getStockClassById, getTotalNumberOfStockClasses } from "../controllers/stockClassController.js";
import { createStockClass } from "../db/operations/create.js";
import { readIssuerById } from "../db/operations/read.js";
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
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

stockClass.get("/total-number", async (req, res) => {
    const { contract } = req;
    try {
        const totalStockClasses = await getTotalNumberOfStockClasses(contract);
        res.status(200).send(totalStockClasses);
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

/// @dev: stock class is always created onchain, then to the DB
stockClass.post("/create", async (req, res) => {
    const { contract } = req;
    const { data, issuerId } = req.body;

    try {
        const issuer = await readIssuerById(issuerId);

        // OCF doesn't allow extra fields in their validation
        const incomingStockClassToValidate = {
            id: uuid(),
            object_type: "STOCK_CLASS",
            ...data,
        };

        const incomingStockClassForDB = {
            ...incomingStockClassToValidate,
            issuer: issuer._id,
        };
        await validateInputAgainstOCF(incomingStockClassToValidate, stockClassSchema);

        await convertAndReflectStockClassOnchain(contract, incomingStockClassForDB);

        const stockClass = await createStockClass(incomingStockClassForDB);

        console.log("✅ | Stock Class created offchain:", stockClass);

        res.status(200).send({ stockClass });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

// Register a stock class that the caller already created onchain from their own wallet.
// The caller MUST supply `id` (the UUID form of the bytes16 used in their onchain tx).
// We persist it as `_id` so the poller's update-by-_id lookup matches when it processes
// the StockClassCreated event.
stockClass.post("/register-onchain", async (req, res) => {
    const { data, issuerId, id } = req.body;

    if (!id) {
        return res.status(400).send("id is required (UUID form of the bytes16 used in the onchain createStockClass tx)");
    }

    try {
        const issuer = await readIssuerById(issuerId);

        const incomingStockClassToValidate = {
            id,
            object_type: "STOCK_CLASS",
            ...data,
        };

        const incomingStockClassForDB = {
            ...incomingStockClassToValidate,
            _id: id,
            issuer: issuer._id,
        };

        await validateInputAgainstOCF(incomingStockClassToValidate, stockClassSchema);

        const stockClass = await createStockClass(incomingStockClassForDB);

        console.log("✅ | Stock Class metadata registered for onchain id:", id);

        res.status(200).send({ stockClass });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});

export default stockClass;
