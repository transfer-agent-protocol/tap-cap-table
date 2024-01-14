import axios from "axios";
import { connectDB } from "../config/mongoose.ts";
import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { stockRetract } from "./sampleData.js";

// Connect to MongoDB
connectDB();

const main = async () => {
    console.log("⏳ | Creating stock retraction…");

    // latest StockIssuance record inserted
    const lastStockIssuance = await StockIssuance.find().sort({ updatedAt: -1 }).limit(1);
    console.log("lastStockIssuance", lastStockIssuance[0]);
    const { issuer, security_id, stakeholder_id, stock_class_id } = lastStockIssuance[0];

    const stockRetraction = await axios.post(
        "http://localhost:8080/transactions/retract/stock",
        stockRetract(
            issuer, // Issuer ID
            stakeholder_id, // Stakeholder ID
            stock_class_id, // StockClass ID
            security_id, // Security ID
            "Retracted"
        )
    );

    console.log("✅ | stockRetractionResponse", stockRetraction.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
