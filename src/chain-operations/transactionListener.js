import { verifyIssuerAndSeed } from "./seed.js";
import {
    handleStockCancellation,
    handleIssuerAuthorizedSharesAdjusted,
    handleStockAcceptance,
    handleStockReissuance,
    handleStockRepurchase,
    handleStockRetraction,
    handleStockClass,
    handleStakeholder,
    handleStockIssuance,
    handleStockTransfer,
    handleStockClassAuthorizedSharesAdjusted,
} from "./transactionHandlers.js";
import { AbiCoder } from "ethers";
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

const abiCoder = new AbiCoder();
const eventQueue = [];
let issuerEventFired = false;

const txStructMapper = {
    STOCK_CANCELLATION: [StockCancellation],
    STOCK_RETRACTION: [StockRetraction],
    STOCK_REISSUANCE: [StockReissuance],
    STOCK_REPURCHASE: [StockRepurchase],
    STOCK_ACCEPTANCE: [StockAcceptance],
    ISSUER_AUTHORIZED_SHARES_ADJUSTMENT: [IssuerAuthorizedSharesAdjustment],
    STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT: [StockClassAuthorizedSharesAdjustment],
    STOCK_ISSUANCE: [StockIssuance],
    STOCK_TRANSFER: [StockTransfer],
};

const TxType = {
    0: "INVALID",
    1: "ISSUER_AUTHORIZED_SHARES_ADJUSTMENT",
    2: "STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT",
    3: "STOCK_ACCEPTANCE",
    4: "STOCK_CANCELLATION",
    5: "STOCK_ISSUANCE",
    6: "STOCK_REISSUANCE",
    7: "STOCK_REPURCHASE",
    8: "STOCK_RETRACTION",
    9: "STOCK_TRANSFER",
};
async function startOnchainListeners(contract, provider, issuerId, libraries) {
    console.log("🌐 | Initiating on-chain event listeners for ", contract.target);

    libraries.txHelper.on("TxCreated", async (_, txTypeIdx, txData, event) => {
        const type = TxType[txTypeIdx];
        const structType = txStructMapper[type];
        const decodedData = await abiCoder.decode(structType, txData);
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type, data: decodedData[0], issuerId, timestamp });
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
            case "INVALID":
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
        }
        sortedEventQueue.shift();
    }
}

export default startOnchainListeners;
