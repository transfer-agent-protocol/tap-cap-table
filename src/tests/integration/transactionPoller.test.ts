import axios from "axios";
import { pollingSleepTime } from "../../chain-operations/transactionPoller";
import Factory from "../../db/objects/Factory";
import { web3WaitTime } from "../../db/operations/update";
import { issuer as exampleIssuer, stakeholder1, stakeholder2, stockClass, stockIssuance, stockTransfer } from "../../scripts/sampleData";
import sleep from "../../utils/sleep";
import { SERVER_BASE, runLocalServer, shutdownLocalServer } from "./utils";


// Pro-tip: set this to iterate faster in dev after `seedExampleData` finishes
const HARDCODED_ISSUER_ID = "4e25e7b9-9718-4c95-9f74-57a729b9cfb2";

beforeAll(async () => {
    await runLocalServer(!HARDCODED_ISSUER_ID);
}, 10000);

afterAll(shutdownLocalServer, 10000);

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

    const issuerResponse = await axios.post(`${SERVER_BASE}/issuer/create`, exampleIssuer);
    const issuerId = issuerResponse.data.issuer._id;
    console.log("✅ | Issuer response ", issuerId, issuerResponse.data);
    await allowPropagate();
       
    const stakeholder1Response = await axios.post(`${SERVER_BASE}/stakeholder/create`, stakeholder1(issuerId));
    const s1Id = stakeholder1Response.data.stakeholder._id;
    console.log("✅ | stakeholder1Response", s1Id, stakeholder1Response.data);
    await allowPropagate();
    
    const stakeholder2Response = await axios.post(`${SERVER_BASE}/stakeholder/create`, stakeholder2(issuerId));
    const s2Id = stakeholder2Response.data.stakeholder._id;
    console.log("✅ | stakeholder2Response", s2Id, stakeholder2Response.data);
    await allowPropagate();
    
    const stockClassResponse = await axios.post(`${SERVER_BASE}/stock-class/create`, stockClass(issuerId));
    const stockClassId = stockClassResponse.data.stockClass._id;
    console.log("✅ | stockClassResponse", stockClassId, stockClassResponse.data);
    await allowPropagate();
    
    const stockIssuanceResponse = await axios.post(
        `${SERVER_BASE}/transactions/issuance/stock`,
        stockIssuance(issuerId, s1Id, stockClassId, "500", "1.2")
    );
    const issuance = stockIssuanceResponse.data.stockIssuance;
    console.log("✅ | stockIssuanceResponse", issuance);
    await allowPropagate();
    
    // TODO: Victor going to finalize these?
    // const { security_id } = issuance;
    // const stockIssuanceAcceptanceResp = await axios.post(
    //     `${SERVER_BASE}/transactions/accept/stock`,
    //     stockAccept(issuerId, s1Id, stockClassId, security_id, ["Accepted"])
    // );
    // console.log("✅ | Stock issuance acceptance response", stockIssuanceAcceptanceResp.data);
    // await allowPropagate();
    
    const stockTransferResponse = await axios.post(
        `${SERVER_BASE}/transactions/transfer/stock`,
        stockTransfer(issuerId, "200", s1Id, s2Id, stockClassId, "4.20")
    );
    console.log("✅ | stockTransferResponse", stockTransferResponse.data);
    await allowPropagate();
    
    // TODO: Victor going to finalize these?
    // const stockTransferAcceptanceResp = await axios.post(
    //     `${SERVER_BASE}/transactions/accept/stock`,
    //     stockAccept(issuerId, s2Id, stockClassId, security_id, ["Accepted"])
    // );
    // console.log("✅ | Stock transfer acceptance response", stockTransferAcceptanceResp.data);
    // await allowPropagate();

    // Allow time for poller process to catch up
    await sleep(pollingSleepTime + web3WaitTime + 2000);

    return issuerId;
}

const checkRecs = async (issuerId) => {
    // TODO: aggregate docs across activePositions to 
    const { data: capTable } = await axios.get(`${SERVER_BASE}/cap-table/latest?issuerId=${issuerId}`);
    console.log("cap Table Latest: ", capTable);

}

test('end to end with event processing', async () => {
    const issuerId = HARDCODED_ISSUER_ID || await seedExampleData();
    await checkRecs(issuerId);
    
}, WAIT_TIME * 100);
