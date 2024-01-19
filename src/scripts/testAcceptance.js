import axios from "axios";
import { connectDB } from "../config/mongoose.ts";
import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { stockAccept } from "./sampleData.js";

connectDB();

const main = async () => {
    console.log("⏳ | Creating stock acceptance…");

    const lastStockIssuance = await StockIssuance.find().sort({ updatedAt: -1 }).limit(1);
    const { issuer, security_id, stakeholder_id, stock_class_id, quantity } = lastStockIssuance[0];
    console.log({ issuer, security_id, stakeholder_id, stock_class_id, quantity });

    const stockAcceptanceResp = await axios.post(
        "http://localhost:8080/transactions/accept/stock",
        stockAccept(
            issuer, // Issuer ID
            stakeholder_id, // Stakeholder ID
            stock_class_id, // StockClass ID
            security_id, // Security ID
            ["Accepted"]
        )
    );

    console.log("✅ | Stock acceptance response", stockAcceptanceResp.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
