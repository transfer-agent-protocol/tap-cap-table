import { ParamType } from "ethers";
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
import { ethers, AbiCoder } from "ethers";

const abiCoder = new AbiCoder();
const eventQueue = [];
let issuerEventFired = false;
const StockIssuanceType = ParamType.from({
    type: "tuple",
    baseType: "tuple",
    components: [
        ParamType.from({ type: "bytes16", baseType: "bytes16", name: "id" }),
        ParamType.from({ type: "string", baseType: "string", name: "object_type" }),
        ParamType.from({ type: "bytes16", baseType: "bytes16", name: "security_id" }),
        ParamType.from({
            type: "tuple",
            baseType: "tuple",
            name: "params",
            components: [
                ParamType.from({ type: "bytes16", baseType: "bytes16", name: "stock_class_id" }),
                ParamType.from({ type: "bytes16", baseType: "bytes16", name: "stock_plan_id" }),
                ParamType.from({
                    type: "tuple",
                    baseType: "tuple",
                    name: "share_numbers_issued",
                    components: [
                        ParamType.from({ type: "uint256", baseType: "uint256", name: "starting_share_number" }),
                        ParamType.from({ type: "uint256", baseType: "uint256", name: "ending_share_number" }),
                    ],
                }),
                ParamType.from({ type: "uint256", baseType: "uint256", name: "share_price" }),
                ParamType.from({ type: "uint256", baseType: "uint256", name: "quantity" }),
                ParamType.from({ type: "bytes16", baseType: "bytes16", name: "vesting_terms_id" }),
                ParamType.from({ type: "uint256", baseType: "uint256", name: "cost_basis" }),
                ParamType.from({
                    type: "bytes16[]",
                    baseType: "array",
                    arrayLength: -1,
                    arrayChildren: ParamType.from({ type: "bytes16", baseType: "bytes16" }),
                    name: "stock_legend_ids",
                }),
                ParamType.from({ type: "string", baseType: "string", name: "issuance_type" }),
                ParamType.from({
                    type: "string[]",
                    baseType: "array",
                    arrayLength: -1,
                    arrayChildren: ParamType.from({ type: "string", baseType: "string" }),
                    name: "comments",
                }),
                ParamType.from({ type: "string", baseType: "string", name: "custom_id" }),
                ParamType.from({ type: "bytes16", baseType: "bytes16", name: "stakeholder_id" }),
                ParamType.from({ type: "string", baseType: "string", name: "board_approval_date" }),
                ParamType.from({ type: "string", baseType: "string", name: "stockholder_approval_date" }),
                ParamType.from({ type: "string", baseType: "string", name: "consideration_text" }),
                ParamType.from({
                    type: "string[]",
                    baseType: "array",
                    arrayLength: -1,
                    arrayChildren: ParamType.from({ type: "string", baseType: "string" }),
                    name: "security_law_exemptions",
                }),
            ],
        }),
    ],
});
const txStructMapper = {
    ShareNumbersIssued: ["uint256", "uint256"],
    StockCancellation: ["bytes16", "string", "uint256", ["string"], "bytes16", "string", "bytes16"],
    StockRetraction: ["bytes16", "string", ["string"], "bytes16", "string"],
    StockReissuance: ["bytes16", "string", ["string"], "bytes16", ["bytes16"], "bytes16", "string"],
    StockRepurchase: ["bytes16", "string", ["string"], "bytes16", "string", "bytes16", "uint256", "uint256"],
    StockAcceptance: ["bytes16", "string", "bytes16", ["string"]],
    IssuerAuthorizedSharesAdjustment: ["bytes16", "string", "uint256", ["string"], "string", "string"],
    StockClassAuthorizedSharesAdjustment: ["bytes16", "string", "uint256", ["string"], "string", "string"],
    STOCK_ISSUANCE: [StockIssuanceType],
    StockLegendTemplate: ["bytes16"],
    StockParamsQuantity: ["uint256", "uint256", "bytes16", "bytes16", "bytes16", ["string"], "string"],
    StockParams: ["bytes16", "bytes16", "bytes16", ["string"], "string"],
    StockTransferParams: ["bytes16", "bytes16", "bytes16", "bool", "uint256", "uint256", "uint256"],
    StockTransfer: ["bytes16", "string", "uint256", ["string"], "bytes16", "string", "bytes16", ["bytes16"]],
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
        console.log(decodedData.id);
        console.log({ decodedData });
        const { timestamp } = await provider.getBlock(event.blockNumber);
        eventQueue.push({ type, data: decodedData, issuerId, timestamp });
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
