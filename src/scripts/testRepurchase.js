import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { stockRepurchase } from "./sampleData.js";
import axios from "axios";
import connectDB from "../db/config/mongoose.js";
connectDB();

const main = async () => {
    const lastStockIssuance = await StockIssuance.find().sort({ _id: -1 }).limit(1);
    console.log("lastStockIssuance", lastStockIssuance[0]);
    const { issuer, security_id, stakeholder_id, stock_class_id, quantity} = lastStockIssuance[0];
    console.log("..creating stock repurchase");
    const stockReissueResp = await axios.post(
        "http://localhost:8080/transactions/repurchase/stock",
        stockRepurchase(
            issuer, // Issuer ID
            quantity,
            "1.1",
            stakeholder_id, // Stakeholder ID
            stock_class_id, // StockClass ID
            security_id, // Security ID
            ["repurchase"]
        )
    );

    console.log("stockReissueResponse", stockReissueResp.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
