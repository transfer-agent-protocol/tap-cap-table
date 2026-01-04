import axios from "axios";
import { connectDB } from "../config/mongoose.ts";
import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { stockClassAuthorizedSharesAdjust } from "./sampleData.js";

connectDB();

const main = async () => {
    const lastStockIssuance = await StockIssuance.find().sort({ updatedAt: -1 }).limit(1);
    const { issuer, security_id, stakeholder_id, stock_class_id, quantity } = lastStockIssuance[0];
    const stockClassAdjResponse = await axios.post(
        "http://localhost:8080/transactions/adjust/stock-class/authorized-shares",
        stockClassAuthorizedSharesAdjust(
            issuer, // Issuer ID
            stock_class_id, // Stock Class ID
            "11000000",
            [`Adjusting stock class authorized shares for ${stock_class_id} - issuer ${issuer}`]
        )
    );
    console.log("stockClassResponse", stockClassAdjResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
