import { issuer, stockClass, stockClassAuthorizedSharesAdjust } from "./sampleData.js";
import axios from "axios";


const main = async () => {
    console.log("..creating issuer");
    const issuerResponse = await axios.post("http://localhost:8080/issuer/create", issuer);
    console.log("issuer response ", issuerResponse.data);

    console.log("..creating stock class");
    const stockClassResponse = await axios.post("http://localhost:8080/stock-class/create", stockClass(issuerResponse.data.issuer._id));
    console.log("stockClassResponse", stockClassResponse.data);

    const stockClassAdjResponse = await axios.post("http://localhost:8080/stock-class/adjust",
        stockClassAuthorizedSharesAdjust(
            issuerResponse._id,
            stockClassResponse._id,
            "1000"
        ))
    console.log("stockClassResponse", stockClassAdjResponse .data);


};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
