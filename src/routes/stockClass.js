import { Router } from "express";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";

const stockClass = Router();

stockClass.get("/", async (req, res) => {
    res.send(`Hello Stock Class!`);
});

// Onchain routes
stockClass.get("/onchain/:id", async (req, res) => {
    const stockClassAdded = await contract.getStockClassById(stockClassIdBytes16);
    console.log("--- Stock Class for Existing ID ---");
    console.log("Getting new stock class:");
    console.log("ID:", stockClassAdded[0]);
    console.log("Type:", stockClassAdded[1]);
    console.log("Price Per Share:", toDecimalPrice(stockClassAdded[2].toString()));
    console.log("Initial Shares Authorized:", stockClassAdded[3].toString());
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

        res.status(200).send(id);
    } catch (error) {
        console.error("Error encountered:", error);
    }
});

// Offchain routes

export default stockClass;
