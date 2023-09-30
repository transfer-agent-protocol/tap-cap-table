import axios from "axios";
import { issuer, stakeholder1, stakeholder2, stockClass, stockIssuance, stockTransfer, stockCancel} from "./sampleData.js";

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




    console.log("..creating stock cancel");
    const stockCacellationResponse = await axios.post(
        "http://localhost:8080/transactions/cancel/stock",
        stockCancel(
            issuerResponse.data.issuer._id,
            "3000",
            stakeholder1Response.data.stakeholder._id,
            stockClassResponse.data.stockClass._id,
            stockIssuanceResponse.data.security_id,
            "Diluted"
        )
    );

    console.log("stockCancellationResponse", stockCacellationResponse.data);

    console.log("..creating stock transfer");
    // create stockTransfer
    const stockTransferResponse = await axios.post(
        "http://localhost:8080/transactions/transfer/stock",
        stockTransfer(
            issuerResponse.data.issuer._id,
            "1",
            stakeholder1Response.data.stakeholder._id,
            stakeholder2Response.data.stakeholder._id,
            stockClassResponse.data.stockClass._id,
            "4.20"
        )
    );

    console.log("stockTransferResponse", stockTransferResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });

