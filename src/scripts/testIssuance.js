import axios from "axios";
import { issuer, stakeholder1, stakeholder2, stockClass, stockIssuance, stockTransfer } from "./sampleData.js";

const main = async () => {
    console.log("..creating issuer");
    // create issuer
    const issuerResponse = await axios.post("http://localhost:8080/issuer/create", issuer);

    console.log("issuer response ", issuerResponse.data);

    console.log("..creating first stakeholder");

    // console.log("stakeholder1", stakeholder1);
    // create two stakeholders
    const stakeholder1Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder1(issuerResponse.data.issuer._id));

    console.log("stakeholder1Response", stakeholder1Response.data);
    console.log("finished");

    console.log("..creating second stakeholder");

    const stakeholder2Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder2(issuerResponse.data.issuer._id));

    console.log("stakeholder2Response", stakeholder2Response.data);

    console.log("..creating stock class");

    // create stockClass
    const stockClassResponse = await axios.post("http://localhost:8080/stock-class/create", stockClass(issuerResponse.data.issuer._id));

    console.log("stockClassResponse", stockClassResponse.data);

    console.log("..creating stock issuance");

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

    console.log("stockIssuanceResponse1", stockIssuanceResponse.data);

    // const stockIssuanceResponse2 = await axios.post(
    //     "http://localhost:8080/transactions/issuance/stock",
    //     stockIssuance(
    //         issuerResponse.data.issuer._id,
    //         stakeholder1Response.data.stakeholder._id,
    //         stockClassResponse.data.stockClass._id,
    //         "4000",
    //         "1.3"
    //     )
    // );

    // console.log("stockIssuanceResponse2", stockIssuanceResponse.data);

    // const stockIssuanceResponse3 = await axios.post(
    //     "http://localhost:8080/transactions/issuance/stock",
    //     stockIssuance(
    //         issuerResponse.data.issuer._id,
    //         stakeholder1Response.data.stakeholder._id,
    //         stockClassResponse.data.stockClass._id,
    //         "1000",
    //         "1.4"
    //     )
    // );

    // console.log("stockIssuanceResponse3", stockIssuanceResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
