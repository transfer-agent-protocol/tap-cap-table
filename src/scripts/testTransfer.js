import axios from "axios";
import { issuer, stakeholder1, stakeholder2, stockClass, stockIssuance, stockTransfer } from "./sampleData.js";
import sleep from "../utils/sleep.js";

const main = async () => {
    console.log("⏳ | Creating issuer…");
    // create issuer
    const issuerResponse = await axios.post("http://localhost:8080/issuer/create", issuer);

    console.log("✅ | Issuer response ", issuerResponse.data);

    await sleep(3000);

    console.log("..creating first stakeholder");

    // create two stakeholders
    const stakeholder1Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder1(issuerResponse.data.issuer._id));

    console.log("✅ | stakeholder1Response", stakeholder1Response.data);
    console.log("✅ | Finished");

    await sleep(3000);

    console.log("⏳ | Creating second stakeholder…");

    const stakeholder2Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder2(issuerResponse.data.issuer._id));

    console.log("✅ | stakeholder2Response", stakeholder2Response.data);

    await sleep(3000);

    console.log("⏳ | Creating stock class…");

    // create stockClass
    const stockClassResponse = await axios.post("http://localhost:8080/stock-class/create", stockClass(issuerResponse.data.issuer._id));

    console.log("✅ | stockClassResponse", stockClassResponse.data);

    await sleep(3000);

    console.log("⏳ | Creating stock issuance…");

    // create stockIssuance
    const stockIssuanceResponse = await axios.post(
        "http://localhost:8080/transactions/issuance/stock",
        stockIssuance(
            issuerResponse.data.issuer._id,
            stakeholder1Response.data.stakeholder._id,
            stockClassResponse.data.stockClass._id,
            "3000",
            "1.2"
        )
    );
    console.log("✅ | stockIssuanceResponse1", stockIssuanceResponse.data);

    console.log("⏳ | Creating stock transfer…");
    // create stockTransfer
    const stockTransferResponse = await axios.post(
        "http://localhost:8080/transactions/transfer/stock",
        stockTransfer(
            issuerResponse.data.issuer._id,
            "2500",
            stakeholder1Response.data.stakeholder._id,
            stakeholder2Response.data.stakeholder._id,
            stockClassResponse.data.stockClass._id,
            "4.20"
        )
    );

    console.log("✅ | stockTransferResponse", stockTransferResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
