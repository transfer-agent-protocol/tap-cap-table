import { Router } from "express";
import { convertUUIDToBytes16, convertBytes16ToUUID } from "../utils/convertUUID.js";
import { toScaledBigNumber, toDecimal } from "../utils/convertToFixedPointDecimals.js";

const stockClass = Router();

stockClass.get("/", async (req, res) => {
    res.send(`Hello Stock Class!`);
});

// Onchain routes
stockClass.get("/onchain/id/:id", async (req, res) => {
    const { contract } = req;
    const { id } = req.params;

    const stockClassIdBytes16 = convertUUIDToBytes16(id);
    const stockClassAdded = await contract.getStockClassById(stockClassIdBytes16);

    console.log("--- Stock Class for Existing ID ---");
    console.log("Getting new stock class:");
    console.log("ID:", convertBytes16ToUUID(stockClassAdded[0]));
    console.log("Type:", stockClassAdded[1]);
    console.log("Price Per Share:", toDecimal(stockClassAdded[2]));
    console.log("Initial Shares Authorized:", toDecimal(stockClassAdded[3]));

    res.status(200).send({
        id: convertBytes16ToUUID(stockClassAdded[0]),
        class_type: stockClassAdded[1],
        price_per_share: toDecimal(stockClassAdded[2].toString()),
        initial_shares_authorized: toDecimal(stockClassAdded[3]).toString(),
    });
});

stockClass.get("/onchain/total-number", async (req, res) => {
    const { contract } = req;
    try {
        const totalStockClasses = await contract.getTotalNumberOfStockClasses();
        console.log("Total number of stock classes:", totalStockClasses.toString());

        res.status(200).send(totalStockClasses.toString());
    } catch (error) {
        console.error("Error encountered:", error.error.reason);
    }
});

stockClass.post("/onchain/reflect", async (req, res) => {
    const { contract } = req;
    const { id, class_type, price_per_share, initial_shares_authorized } = req.body;

    try {
        const stockClassIdBytes16 = convertUUIDToBytes16(id);
        const scaledSharePrice = toScaledBigNumber(price_per_share);
        console.log("scaledSharePrice", scaledSharePrice.toString());
        const scaledShares = toScaledBigNumber(initial_shares_authorized);
        console.log("scaled shares", scaledShares.toString());

        const newStockClass = await contract.createStockClass(stockClassIdBytes16, class_type, scaledSharePrice, scaledShares);
        await newStockClass.wait();

        console.log("--- New Stock Class Created Onchain ---");
        console.log("ID:", id);
        console.log("Type:", class_type);
        console.log("Price Per Share:", price_per_share);
        console.log("Initial Shares Authorized:", initial_shares_authorized);

        res.status(200).send(id);
    } catch (error) {
        console.error("Error encountered:", error);
    }
});

// Offchain routes

export default stockClass;
