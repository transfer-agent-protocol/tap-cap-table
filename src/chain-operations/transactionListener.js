/*
DEPRECATED! DO NOT USE
TODO: delete 
*/


import { AbiCoder } from "ethers";
import { verifyIssuerAndSeed } from "./seed.js";
import {
    IssuerAuthorizedSharesAdjustment,
    StockAcceptance,
    StockCancellation,
    StockClassAuthorizedSharesAdjustment,
    StockIssuance,
    StockReissuance,
    StockRepurchase,
    StockRetraction,
    StockTransfer,
} from "./structs.js";
import {
    handleIssuerAuthorizedSharesAdjusted,
    handleStakeholder,
    handleStockAcceptance,
    handleStockCancellation,
    handleStockClass,
    handleStockClassAuthorizedSharesAdjusted,
    handleStockIssuance,
    handleStockReissuance,
    handleStockRepurchase,
    handleStockRetraction,
    handleStockTransfer,
} from "./transactionHandlers.js";

const abiCoder = new AbiCoder();
const eventQueue = [];
let issuerEventFired = false;

const txMapper = {
    0: ["INVALID"],
    1: ["ISSUER_AUTHORIZED_SHARES_ADJUSTMENT", IssuerAuthorizedSharesAdjustment],
    2: ["STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT", StockClassAuthorizedSharesAdjustment],
    3: ["STOCK_ACCEPTANCE", StockAcceptance],
    4: ["STOCK_CANCELLATION", StockCancellation],
    5: ["STOCK_ISSUANCE", StockIssuance],
    6: ["STOCK_REISSUANCE", StockReissuance],
    7: ["STOCK_REPURCHASE", StockRepurchase],
    8: ["STOCK_RETRACTION", StockRetraction],
    9: ["STOCK_TRANSFER", StockTransfer],
};

async function startOnchainListeners(contract, provider, issuerId, libraries) {
    console.log("🌐 | Initiating on-chain event listeners for issuer", issuerId, "at address", contract.target);

    libraries.txHelper.on("TxCreated", async (_, txTypeIdx, txData, event) => {
        const [type, structType] = txMapper[txTypeIdx];
        const decodedData = abiCoder.decode([structType], txData);
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type, data: decodedData[0], issuerId, timestamp });
    });

    contract.on("StakeholderCreated", async (id, _) => {
        eventQueue.push({ type: "STAKEHOLDER_CREATED", data: id });
    });

    contract.on("StockClassCreated", async (id, _) => {
        eventQueue.push({ type: "STOCK_CLASS_CREATED", data: id });
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
            case "STAKEHOLDER_CREATED":
                await handleStakeholder(event.data);
                break;
            case "STOCK_CLASS_CREATED":
                await handleStockClass(event.data);
                break;
            case "ISSUER_AUTHORIZED_SHARES_ADJUSTMENT":
                await handleIssuerAuthorizedSharesAdjusted(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT":
                await handleStockClassAuthorizedSharesAdjusted(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_ACCEPTANCE":
                await handleStockAcceptance(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_CANCELLATION":
                await handleStockCancellation(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_ISSUANCE":
                await handleStockIssuance(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_REISSUANCE":
                await handleStockReissuance(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_REPURCHASE":
                await handleStockRepurchase(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_RETRACTION":
                await handleStockRetraction(event.data, event.issuerId, event.timestamp);
                break;
            case "STOCK_TRANSFER":
                await handleStockTransfer(event.data, event.issuerId, event.timestamp);
                break;
            case "INVALID":
                throw new Error("Invalid transaction type");
                break;
        }
        sortedEventQueue.shift();
    }
}

// export default startOnchainListeners;
