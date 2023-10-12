import { issuer, stockClass, stockClassAuthorizedSharesAdjust, issuerAuthorizedSharesAdjust } from "./sampleData.js";
import axios from "axios";

const main = async () => {
    // const stockClassAdjResponse = await axios.post(
    //     "http://localhost:8080/transactions/adjust/stock-class/authorized-shares",
    //     stockClassAuthorizedSharesAdjust(
    //         "11a17b3d-03d6-4d12-a0b8-c9130a907a8c", // Issuer ID
    //         "70388f9f-a707-47dd-b8db-67d61e85e6e6", // Stock Class ID
    //         "1000",
    //         ["adjusting stock class authorized shares"]
    //     )
    // );
    // console.log("stockClassResponse", stockClassAdjResponse.data);

    const issuerAdjustedResponse = await axios.post(
        "http://localhost:8080/transactions/adjust/issuer/authorized-shares",
        issuerAuthorizedSharesAdjust(
            "11a17b3d-03d6-4d12-a0b8-c9130a907a8c", // Issuer ID
            "1000",
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
