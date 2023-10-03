import {stockRetract} from "./sampleData.js";
import axios from "axios";


const main = async () => {
    console.log("..creating stock cancel");
    const stockRetraction = await axios.post(
        "http://localhost:8080/transactions/retract/stock",
        stockRetract(
            "d93968ea-651d-4351-8ede-78171c93f726", // Issuer ID
            "61d6591f-9caf-45d4-aa49-d1fa3202fc11", // Stakeholder ID
            "69d1d542-bd5a-4f8d-889d-16105eff99c4", // StockClass ID
            "cbe4692a-4dd2-f678-2b50-ffebba247555", // Security ID
            "Diluted"
        )
    );

    console.log("stockRetractionResponse", stockRetraction .data);

};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
