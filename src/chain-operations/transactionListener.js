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

const eventQueue = [];
let issuerEventFired = false;

async function startOnchainListeners(contract, provider, issuerId, libraries) {
    console.log("🌐 | Initiating on-chain event listeners for ", contract.target);

    libraries.issuance.on("StockIssuanceCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockIssuanceCreated", data: stock, issuerId, timestamp });
    });

    libraries.transfer.on("StockTransferCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockTransferCreated", data: stock, issuerId, timestamp });
    });
    contract.on("StakeholderCreated", async (id, _) => {
        eventQueue.push({ type: "StakeholderCreated", data: id });
    });

    contract.on("StockClassCreated", async (id, _) => {
        eventQueue.push({ type: "StockClassCreated", data: id });
    });

    libraries.cancellation.on("StockCancellationCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockCancellationCreated", data: stock, issuerId, timestamp });
    });

    libraries.retraction.on("StockRetractionCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockRetractionCreated", data: stock, issuerId, timestamp });
    });

    libraries.reissuance.on("StockReissuanceCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockReissuanceCreated", data: stock, issuerId, timestamp });
    });

    libraries.repurchase.on("StockRepurchaseCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockRepurchaseCreated", data: stock, issuerId, timestamp });
    });

    libraries.acceptance.on("StockAcceptanceCreated", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockAcceptanceCreated", data: stock, issuerId, timestamp });
    });

    libraries.adjustment.on("StockClassAuthorizedSharesAdjusted", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "StockClassAuthorizedSharesAdjusted", data: stock, issuerId, timestamp });
    });

    libraries.adjustment.on("IssuerAuthorizedSharesAdjusted", async (stock, event) => {
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type: "IssuerAuthorizedSharesAdjusted", data: stock, issuerId, timestamp });
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
            case "StockTransferCreated":
                await handleStockTransfer(event.data, event.issuerId, event.timestamp);
                break;
            case "StockReissuanceCreated":
                await handleStockReissuance(event.data, event.issuerId, event.timestamp);
                break;
            case "StockRepurchaseCreated":
                await handleStockRepurchase(event.data, event.issuerId, event.timestamp);
                break;
            case "StockClassAuthorizedSharesAdjusted":
                await handleStockClassAuthorizedSharesAdjusted(event.data, event.issuerId, event.timestamp);
                break;
            case "IssuerAuthorizedSharesAdjusted":
                await handleIssuerAuthorizedSharesAdjusted(event.data, event.issuerId, event.timestamp);
                break;
            case "StockCancellationCreated":
                await handleStockCancellation(event.data, event.issuerId, event.timestamp);
                break;
            case "StockAcceptanceCreated":
                await handleStockAcceptance(event.data, event.issuerId, event.timestamp);
                break;
            case "StockRetractionCreated":
                await handleStockRetraction(event.data, event.issuerId, event.timestamp);
                break;
        }
        sortedEventQueue.shift();
    }
}

export default startOnchainListeners;
