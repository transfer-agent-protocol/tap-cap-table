import axios from "axios";
import { pollingSleepTime } from "../../chain-operations/transactionPoller";
import Factory from "../../db/objects/Factory";
import { web3WaitTime } from "../../db/operations/update";
import {
    issuer as exampleIssuer,
    stakeholder1,
    stakeholder2,
    stakeholder3,
    stockClass,
    stockIssuance,
    stockTransfer,
} from "../../scripts/sampleData";
import sleep from "../../utils/sleep";
import { SERVER_BASE, runLocalServer, shutdownLocalServer } from "./utils";

// Pro-tip: set this to iterate faster in dev after `seedExampleData` finishes
const HARDCODED_ISSUER_ID = null;

beforeAll(async () => {
    await runLocalServer(!HARDCODED_ISSUER_ID);
}, 10000);

afterAll(shutdownLocalServer, 10000 + pollingSleepTime);

const WAIT_TIME = 1000;

const allowPropagate = async () => {
    // Ensure ethers has enough time to catch up
    await sleep(WAIT_TIME);
};

const seedExampleData = async () => {
    const rec = await Factory.findOne();
    const deterministicFactory = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
    if (rec) {
        if (deterministicFactory && rec.factory_address != deterministicFactory) {
            throw new Error(
                `Mismatch between hardcoded factory ${deterministicFactory} and the one in mongo ${rec.factory_address}.
                If this is expected, set deterministicFactory=null to avoid this failure`
            );
        }
    } else {
        const resp = await axios.post(`${SERVER_BASE}/factory/register`, { factory_address: deterministicFactory });
        console.log("Used deterministic factory address. May need to change in future", resp.data);
        // throw new Error(
        //     `Manually create the {"implementation_address": ..., "factory_address": ...} record
        //     in "factories" collection. Use output of 'yarn deploy-factory' against a local 'anvil'
        //     server: "CapTableFactory deployed at: {factory_address}"`
        // );
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

    const stakeholder3Response = await axios.post(`${SERVER_BASE}/stakeholder/create`, stakeholder3(issuerId));
    const s3Id = stakeholder3Response.data.stakeholder._id;
    console.log("✅ | stakeholder3Response", s3Id, stakeholder3Response.data);
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

    // TODO: Victor acceptance of issuance?
    // const { security_id } = issuance;
    // const stockIssuanceAcceptanceResp = await axios.post(
    //     `${SERVER_BASE}/transactions/accept/stock`,
    //     stockAccept(issuerId, s1Id, stockClassId, security_id, ["Accepted"])
    // );
    // console.log("✅ | Stock issuance acceptance response", stockIssuanceAcceptanceResp.data);
    // await allowPropagate();

    const stockTransfer1Response = await axios.post(
        `${SERVER_BASE}/transactions/transfer/stock`,
        stockTransfer(issuerId, "200", s1Id, s2Id, stockClassId, "4.20")
    );
    console.log("✅ | stockTransfer1Response", stockTransfer1Response.data);
    await allowPropagate();

    // TODO: Victor acceptance of transfer1?
    // const stockTransferAcceptanceResp = await axios.post(
    //     `${SERVER_BASE}/transactions/accept/stock`,
    //     stockAccept(issuerId, s2Id, stockClassId, security_id, ["Accepted"])
    // );
    // console.log("✅ | Stock transfer acceptance response", stockTransferAcceptanceResp.data);
    // await allowPropagate();

    const stockTransfer2Response = await axios.post(
        `${SERVER_BASE}/transactions/transfer/stock`,
        stockTransfer(issuerId, "125", s1Id, s3Id, stockClassId, "10.66")
    );
    console.log("✅ | stockTransfer2Response", stockTransfer2Response.data);
    await allowPropagate();

    const stockTransfer3Response = await axios.post(
        `${SERVER_BASE}/transactions/transfer/stock`,
        stockTransfer(issuerId, "175", s1Id, s3Id, stockClassId, "8.42")
    );
    console.log("✅ | stockTransfer3Response", stockTransfer3Response.data);
    await allowPropagate();

    // TODO: acceptance of transfer2?

    // Allow time for poller process to catch up
    await sleep(pollingSleepTime + web3WaitTime + 2000);

    return issuerId;
};

const checkRecs = async (issuerId) => {
    const {
        data: { holdings },
    } = await axios.get(`${SERVER_BASE}/cap-table/holdings/stock?issuerId=${issuerId}`);
    let portions = holdings.map(({ quantity, sharePrice, stakeholder }) => {
        return { quantity, sharePrice: parseFloat(sharePrice.toFixed(2)), name: stakeholder.name.legal_name };
    });
    portions.sort((a, b) => b.quantity - a.quantity);
    expect(portions).toStrictEqual([
        { quantity: 300, sharePrice: 9.35, name: "Kent Kolze" },
        { quantity: 200, sharePrice: 4.2, name: "Alex Fong" },
    ]);
};

test(
    "end to end with event processing",
    async () => {
        const issuerId = HARDCODED_ISSUER_ID || (await seedExampleData());
        await checkRecs(issuerId);
    },
    WAIT_TIME * 100
);
