import axios from "axios";
import sleep from "../utils/sleep.js";
import { issuer, stakeholder1, stakeholder2, stockClass, stockIssuance } from "./sampleData.js";

const main = async () => {
    console.log("⏳ | Creating issuer…");
    // create issuer
    const issuerResponse = await axios.post("http://localhost:8080/issuer/create", issuer);

    console.log("✅ | Issuer response ", issuerResponse.data);

    await sleep(3000);

    console.log("⏳ | Creating first stakeholder");

    // create two stakeholders
    const stakeholder1Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder1(issuerResponse.data.issuer._id));

    console.log("✅ | stakeholder1Response", stakeholder1Response.data);
    console.log("✅ | finished");

    await sleep(3000);

    console.log("⏳ | Creating second stakeholder…");

    const stakeholder2Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder2(issuerResponse.data.issuer._id));

    console.log("✅ | stakeholder2Response", stakeholder2Response.data);

    await sleep(3000);

    console.log("⏳| Creating stock class");

    // create stockClass
    const stockClassResponse = await axios.post("http://localhost:8080/stock-class/create", stockClass(issuerResponse.data.issuer._id));

    console.log("✅ | stockClassResponse", stockClassResponse.data);
};

main()
    .then()
    .catch((err) => {
        console.error(err);
    });
