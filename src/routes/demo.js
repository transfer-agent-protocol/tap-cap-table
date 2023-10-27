import { Router } from "express";
import { v4 as uuid } from "uuid";
import issuerSchema from "../../ocf/schema/objects/Issuer.schema.json" assert { type: "json" };
import { deployDemoCapTableOptimismGoerli } from "../chain-operations/deployCapTable.js";
import { createIssuer } from "../db/operations/create.js";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import validateInputAgainstOCF from "../utils/validateInputAgainstSchema.js";
import { contractCache } from "../utils/caches.js";
import { handleStockClass, handleStakeholder, handleStockIssuance } from "../chain-operations/transactionHandlers.js";

import { verifyIssuerAndSeed } from "../chain-operations/seed.js";
import { contractMiddleware } from '../middlewares.js';

import { convertAndReflectStakeholderOnchain, } from "../controllers/stakeholderController.js"; // Importing the controller functions
import stakeholderSchema from "../../ocf/schema/objects/Stakeholder.schema.json" assert { type: "json" };
import { createStakeholder, createStockClass } from "../db/operations/create.js";
import { readIssuerById } from "../db/operations/read.js";
import stockClassSchema from "../../ocf/schema/objects/StockClass.schema.json" assert { type: "json" };

import { convertAndReflectStockClassOnchain,} from "../controllers/stockClassController.js";

const eventQueue = [];
let issuerEventFired = false;

const demo = Router();

async function startOnchainListeners(contract, provider, issuerId, libraries) {
    console.log("🌐 | Initiating on-chain event listeners for ", contract.target);

    libraries.issuance.on("StockIssuanceCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockIssuanceCreated", data: stock, issuerId, timestamp });
    });

    contract.on("StakeholderCreated", async (id, _) => {
        eventQueue.push({ type: "StakeholderCreated", data: id });
    });

    contract.on("StockClassCreated", async (id, _) => {
        eventQueue.push({ type: "StockClassCreated", data: id });
    });

    const issuerCreatedFilter = contract.filters.IssuerCreated;
    const issuerEvents = await contract.queryFilter(issuerCreatedFilter);

    if (issuerEvents.length > 0 && !issuerEventFired) {
        const id = issuerEvents[0].args[0];
        console.log("IssuerCreated Event Emitted!", id);

        await verifyIssuerAndSeed(contract, id);
        issuerEventFired = true;
    }

    setInterval(processEventQueue, 5000); // Process every 5 seconds
}

async function processEventQueue() {
    const sortedEventQueue = eventQueue.sort((a, b) => a.timestamp - b.timestamp);
    while (sortedEventQueue.length > 0) {
        const event = eventQueue[0];
        switch (event.type) {
            case "StakeholderCreated":
                await handleStakeholder(event.data);
                break;
            case "StockClassCreated":
                await handleStockClass(event.data);
                break;
            case "StockIssuanceCreated":
                await handleStockIssuance(event.data, event.issuerId, event.timestamp);
                break;
        }
        sortedEventQueue.shift();
    }
}

demo.post("/issuer/create", async (req, res) => {
    try {
        // OCF doesn't allow extra fields in their validation
        const { initial_shares_authorized } = req.body;
        const incomingIssuerToValidate = {
            id: uuid(),
            object_type: "ISSUER",
            ...req.body,
        };

        console.log("⏳ | Issuer to validate", incomingIssuerToValidate);

        await validateInputAgainstOCF(incomingIssuerToValidate, issuerSchema);

        const issuerIdBytes16 = convertUUIDToBytes16(incomingIssuerToValidate.id);
        console.log("💾 | Issuer id in bytes16 ", issuerIdBytes16);
        const { contract, provider, address, libraries } = await deployDemoCapTableOptimismGoerli(
            issuerIdBytes16,
            incomingIssuerToValidate.legal_name,
            initial_shares_authorized
        );

        // add contract to the cache and start listener
        contractCache[incomingIssuerToValidate.id] = { contract, provider, libraries };
        startOnchainListeners(contract, provider, incomingIssuerToValidate.id, libraries);

        const incomingIssuerForDB = {
            ...incomingIssuerToValidate,
            deployed_to: address,
        };

        const issuer = await createIssuer(incomingIssuerForDB);

        console.log("✅ | Issuer created offchain:", issuer);

        res.status(200).send({ issuer });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(400).send({ error: error.message });
    }
});

demo.post("transactions/issuance/stock", contractMiddleware, async (req, res) => {
    const { contract } = req;
    const { issuerId, data } = req.body;

    try {
        const issuer = await readIssuerById(issuerId);

        const incomingStockIssuance = {
            id: uuid(), // for OCF Validation
            security_id: uuid(), // for OCF Validation
            date: new Date().toISOString().slice(0, 10), // for OCF Validation
            object_type: "TX_STOCK_ISSUANCE",
            ...data,
        };

        await validateInputAgainstOCF(incomingStockIssuance, stockIssuanceSchema);

        await convertAndCreateIssuanceStockOnchain(contract, incomingStockIssuance);

        res.status(200).send({ stockIssuance: incomingStockIssuance });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(400).send(`${error}`);
    }
});

demo.use('/stakeholder/create', contractMiddleware, async (req, res) => {
    const { contract } = req;
    const { data, issuerId } = req.body;

    try {
        const issuer = await readIssuerById(issuerId);

        // OCF doesn't allow extra fields in their validation
        const incomingStakeholderToValidate = {
            id: uuid(),
            object_type: "STAKEHOLDER",
            ...data,
        };

        const incomingStakeholderForDB = {
            ...incomingStakeholderToValidate,
            issuer: issuer._id,
        };

        await validateInputAgainstOCF(incomingStakeholderToValidate, stakeholderSchema);

        await convertAndReflectStakeholderOnchain(contract, incomingStakeholderForDB);

        const stakeholder = await createStakeholder(incomingStakeholderForDB);

        console.log("✅ | Stakeholder created offchain:", stakeholder);

        res.status(200).send({ stakeholder });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(400).send(`${error}`);
    }
});

demo.use('/stock-class/create', contractMiddleware, async (req, res) => {
    const { contract } = req;
    const { data, issuerId } = req.body;

    try {
        const issuer = await readIssuerById(issuerId);

        // OCF doesn't allow extra fields in their validation
        const incomingStockClassToValidate = {
            id: uuid(),
            object_type: "STOCK_CLASS",
            ...data,
        };

        const incomingStockClassForDB = {
            ...incomingStockClassToValidate,
            issuer: issuer._id,
        };
        await validateInputAgainstOCF(incomingStockClassToValidate, stockClassSchema);
        await convertAndReflectStockClassOnchain(contract, incomingStockClassForDB);

        const stockClass = await createStockClass(incomingStockClassForDB);

        console.log("✅ | Stock Class created offchain:", stockClass);

        res.status(200).send({ stockClass });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(400).send(`${error}`);
    }
});

export default demo;
