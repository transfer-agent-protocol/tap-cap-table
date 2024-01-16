import axios from "axios";
import { shutdownServer, startServer } from "../../app";
import Factory from "../../db/objects/Factory";
import Issuer from "../../db/objects/Issuer";
import { issuer as exampleIssuer, stakeholder1, stakeholder2, stockClass, stockIssuance, stockTransfer } from "../../scripts/sampleData";
import sleep from "../../utils/sleep";
import { deseedDatabase } from "../deseed";


let _server = null

beforeAll(async () => {
    await deseedDatabase();
    console.log("starting server");
    _server = await startServer("latest");
});

afterAll(async () => {
    console.log("shuting down server");
    await shutdownServer(_server);
});

const WAIT_TIME = 1000;

const allowPropagate = async () => {
    // Ensure ethers has enough time to catch up
    await sleep(WAIT_TIME);
}

const seedExampleData = async () => {
    const rec = await Factory.findOne();
    if (!rec) {
        throw new Error(
            `Manually create the {"implementation_adress": ..., "factory_address": ...} record 
            in "factories" collection. Run the "forge script ..." command from the comment 
            in "chain/script/CapTableFactory.s.sol"`
        );
    }

    const issuerResponse = await axios.post("http://localhost:8080/issuer/create", exampleIssuer);
    const issuerId = issuerResponse.data.issuer._id;
    console.log("✅ | Issuer response ", issuerId, issuerResponse.data);
    await allowPropagate();
       
    const stakeholder1Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder1(issuerId));
    const s1Id = stakeholder1Response.data.stakeholder._id;
    console.log("✅ | stakeholder1Response", s1Id, stakeholder1Response.data);
    await allowPropagate();
    
    const stakeholder2Response = await axios.post("http://localhost:8080/stakeholder/create", stakeholder2(issuerId));
    const s2Id = stakeholder2Response.data.stakeholder._id;
    console.log("✅ | stakeholder2Response", s2Id, stakeholder2Response.data);
    await allowPropagate();
    
    const stockClassResponse = await axios.post("http://localhost:8080/stock-class/create", stockClass(issuerId));
    const stockClassId = stockClassResponse.data.stockClass._id;
    console.log("✅ | stockClassResponse", stockClassId, stockClassResponse.data);
    await allowPropagate();
    
    const stockIssuanceResponse = await axios.post(
        "http://localhost:8080/transactions/issuance/stock",
        stockIssuance(issuerId, s1Id, stockClassId, "500", "1.2")
    );
    const issuance = stockIssuanceResponse.data.stockIssuance;
    console.log("✅ | stockIssuanceResponse", issuance);
    await allowPropagate();
    
    // TODO: Victor going to finalize these?
    // const { security_id } = issuance;
    // const stockIssuanceAcceptanceResp = await axios.post(
    //     "http://localhost:8080/transactions/accept/stock",
    //     stockAccept(issuerId, s1Id, stockClassId, security_id, ["Accepted"])
    // );
    // console.log("✅ | Stock issuance acceptance response", stockIssuanceAcceptanceResp.data);
    // await allowPropagate();
    
    const stockTransferResponse = await axios.post(
        "http://localhost:8080/transactions/transfer/stock",
        stockTransfer(issuerId, "200", s1Id, s2Id, stockClassId, "4.20")
    );
    console.log("✅ | stockTransferResponse", stockTransferResponse.data);
    await allowPropagate();
    
    // TODO: Victor going to finalize these?
    // const stockTransferAcceptanceResp = await axios.post(
    //     "http://localhost:8080/transactions/accept/stock",
    //     stockAccept(issuerId, s2Id, stockClassId, security_id, ["Accepted"])
    // );
    // console.log("✅ | Stock transfer acceptance response", stockTransferAcceptanceResp.data);
    // await allowPropagate();

    return issuerId;
}

const checkRecs = async (issuerId) => {
    const issuer = Issuer.findById(issuerId);

    // TODO: aggregate docs across activePositions to 
}

test('end to end with event processing', async () => {
    const issuerId = await seedExampleData();
    // Allow time for background process to catch up
    await sleep(15000);
    await checkRecs(issuerId);
    
}, WAIT_TIME * 100);
