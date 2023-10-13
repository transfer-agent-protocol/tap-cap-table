import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import { stockReissue } from "./sampleData.js";
import axios from "axios";
import connectDB from "../db/config/mongoose.js";
connectDB();

const main = async () => {
    const lastStockIssuance = await StockIssuance.find().sort({ _id: -1 }).limit(1);
    console.log("lastStockIssuance", lastStockIssuance[0]);
    const { issuer, security_id, stakeholder_id, stock_class_id, quantity} = lastStockIssuance[0];
    console.log('issuer', issuer)

    console.log("..creating stock reissuance");
    const stockReissueResp = await axios.post(
        "http://localhost:8080/transactions/reissue/stock",
        stockReissue(
            issuer, // Issuer ID
            stakeholder_id, // Stakeholder ID
            stock_class_id, // StockClass ID
            security_id, // Security ID
            ["2b14be59-2f4c-5bf7-ce44-b315f68c2088"], // Resulting Security IDs
            "reissue"
        )
    );

    console.log("stockReissueResponse", stockReissueResp.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
