import axios from "axios";
import { connectDB } from "../config/mongoose.ts";
import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { stockCancel } from "./sampleData.js";
connectDB();

const main = async () => {
    const lastStockIssuance = await StockIssuance.find().sort({ updatedAt: -1 }).limit(1);
    if (!lastStockIssuance || !lastStockIssuance.length) throw Error("No Issuance Exist")

    const { issuer, security_id, stakeholder_id, stock_class_id, quantity } = lastStockIssuance[0];

    console.log({ issuer, security_id, stakeholder_id, stock_class_id, quantity });

    console.log("⏳ | Creating stock cancellation…");
    const stockCancellation = await axios.post(
        "http://localhost:8080/transactions/cancel/stock",
        stockCancel(
            issuer, // Issuer ID
            quantity,
            stakeholder_id, // Stakeholder ID
            stock_class_id, // StockClass ID
            security_id, // Security ID
            "Cancelled"
        )
    );

    console.log("✅ | Stock cancellation response", stockCancellation.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
