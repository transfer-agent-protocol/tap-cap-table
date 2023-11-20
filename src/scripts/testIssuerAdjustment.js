import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { stockClass, stockClassAuthorizedSharesAdjust, issuerAuthorizedSharesAdjust } from "./sampleData.js";
import axios from "axios";
import connectDB from "../db/config/mongoose.js";
connectDB();

const main = async () => {
    const lastStockIssuance = await StockIssuance.find().sort({ updatedAt: -1 }).limit(1);
    const { issuer, security_id, stakeholder_id, stock_class_id, quantity } = lastStockIssuance[0];

    const issuerAdjustedResponse = await axios.post(
        "http://localhost:8080/transactions/adjust/issuer/authorized-shares",
        issuerAuthorizedSharesAdjust(
            issuer, // Issuer ID
            "5555",
            ["adjusting issuer authorized shares"]
        )
    );
    console.log("✅ | Issuer adjusted response", issuerAdjustedResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
