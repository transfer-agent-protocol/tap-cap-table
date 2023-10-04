import { stockRetract } from "./sampleData.js";
import axios from "axios";

const main = async () => {
    console.log("..creating stock cancel");
    const stockRetraction = await axios.post(
        "http://localhost:8080/transactions/retract/stock",
        stockRetract(
            "3526b591-72e6-40c7-b212-ec2f9cefe775", // Issuer ID
            "9dcfc2eb-1fde-49fa-9e88-2f7c4167ca5d", // Stakeholder ID
            "67aa9223-7a6f-4765-aa7e-66cdfb2cd6f5", // StockClass ID
            "b7da52f5-e77b-1bd3-9f82-af167d99eabc", // Security ID
            "Diluted"
        )
    );

    console.log("stockRetractionResponse", stockRetraction.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
