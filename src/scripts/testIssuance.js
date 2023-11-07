import Issuer from "../db/objects/Issuer.js";
import Stakeholder from "../db/objects/Stakeholder.js";
import StockClass from "../db/objects/StockClass.js";
import axios from "axios";
import { stockIssuance } from "./sampleData.js";
import connectDB from "../db/config/mongoose.js";
connectDB();

const main = async () => {
    console.log("⏳ | Creating stock issuance");

    const lastIssuer = await Issuer.find().sort({ _id: -1 }).limit(1); // finds the latest issuer
    const { _id: issuerId } = lastIssuer[0];

    const lastStakeholder = await Stakeholder.find().sort({ _id: -1 }).limit(1);
    const { _id: stakeholderId } = lastStakeholder[0];

    const lastStockClass = await StockClass.find().sort({ _id: -1 }).limit(1);
    const { _id: stockClassId } = lastStockClass[0];
    console.log({ issuerId, stakeholderId, stockClassId });

    // create stockIssuance
    const stockIssuanceResponse = await axios.post(
        "http://localhost:8080/transactions/issuance/stock",
        stockIssuance(issuerId, stakeholderId, stockClassId, "2000", "1.2")
    );

    console.log("✅ | stockIssuanceResponse1", stockIssuanceResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
