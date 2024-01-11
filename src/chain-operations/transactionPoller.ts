import { AbiCoder } from "ethers";
import { connectDB } from "../db/config/mongoose.ts";
import { withGlobalTransaction } from "../db/operations/atomic.ts";
import { readAllIssuers } from "../db/operations/read.js";
import { updateIssuerById } from "../db/operations/update.js";
import { getIssuerContract } from "../utils/caches.ts";
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

const contractFuncs = new Map([
    ["StakeholderCreated", handleStakeholder],
    ["StockClassCreated", handleStockClass],
]);

const txMapper = {
    0: ["INVALID"],
    1: ["ISSUER_AUTHORIZED_SHARES_ADJUSTMENT", IssuerAuthorizedSharesAdjustment, handleIssuerAuthorizedSharesAdjusted],
    2: ["STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT", StockClassAuthorizedSharesAdjustment, handleStockClassAuthorizedSharesAdjusted],
    3: ["STOCK_ACCEPTANCE", StockAcceptance, handleStockAcceptance],
    4: ["STOCK_CANCELLATION", StockCancellation, handleStockCancellation],
    5: ["STOCK_ISSUANCE", StockIssuance, handleStockIssuance],
    6: ["STOCK_REISSUANCE", StockReissuance, handleStockReissuance],
    7: ["STOCK_REPURCHASE", StockRepurchase, handleStockRepurchase],
    8: ["STOCK_RETRACTION", StockRetraction, handleStockRetraction],
    9: ["STOCK_TRANSFER", StockTransfer, handleStockTransfer],
};

// Map(event.type => handler) derived from the above
const txFuncs = new Map(
    // @ts-ignore
    Object.entries(txMapper).filter((arr) => arr.length === 3).forEach(([_x, [name, _y, handleFunc]]) => [name, handleFunc])
);


const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export const startSynchronousEventProcessing = async () => {
    while (true) {
        await sleep(1 * 1000);
        const issuers = await readAllIssuers();
        const dbConn = await connectDB();
        // Process events synchronously for each issuer
        console.log(`Processing for ${issuers.length} issuers`);
        for (const issuer of issuers) {
            if (issuer.deployed_to) {
                const { contract, provider, libraries } = await getIssuerContract(issuer);
                await processEvents(dbConn, contract, provider, issuer, libraries.txHelper);
            }
        }
    }
};

const processEvents = async (dbConn, contract, provider, issuer, txHelper, maxBlocks = 1500, maxEvents = 250) => {
    /*
    We process up to `maxEvents` across `maxBlocks` to ensure our transaction sizes dont get too big and bog down our db
    */
    console.log(" processEvents for issuer", issuer);
    let {_id: issuerId, last_processed_block: startBlock, tx_hash: deployedTx} = issuer;
    if (startBlock === null) {
        const receipt = await provider.getTransactionReceipt(deployedTx);
        if (!receipt) {
            console.error("Transaction receipt not found");
            return;
        }
        startBlock = await bootstrapTable(issuerId, receipt.blockNumber, contract, dbConn);
    }
    const {number: latestBlock} = await provider.getBlock('finalized');
    let endBlock = Math.min(startBlock + maxBlocks, latestBlock);

    let events: any[] = [];

    // TODO: fix filter
    const contractEvents = await contract.queryFilter("*", startBlock, endBlock);
    for (const event of contractEvents) {
        if (contractFuncs.has(event.type)) {
            // TODO: how to deserialize event.data?
            console.log("contract event: ", event);
            events.push(event);
        }
    }

    // TODO: fix filter
    const txEvents = await txHelper.queryFilter("*", startBlock, endBlock);
    for (const event of txEvents) {
        // TODO: the same processing as libraries.txHelper.on     
        // TODO:  emit TxCreated(transactions.length, txType, txData);
        //  how do we parse the event.data string of each event? 
        //    https://www.npmjs.com/package/@ethersproject/abstract-provider?activeTab=code (line 102: Log.data is string-type)
        console.log("txHelper event: ", event);
        if (event.removed) {
            continue;
        }
        // TODO: does txTypeIdx even come with the event??? need to test this...
        let txTypeIdx;
        let txData;
        const [type, structType] = txMapper[txTypeIdx];
        const decodedData = abiCoder.decode([structType], txData);
        const { timestamp } = await provider.getBlock(event.blockNumber);
        // TODO: I think the below needs a lot of work
        events.push({ ...event, type, timestamp, data: decodedData[0] });
    }

    // Nothing to process
    if (events.length === 0) {
        await updateLastProcessed(issuerId, endBlock);
        return;
    }

    // Process in the correct order
    events.sort((a, b) => a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex);
    [events, endBlock] = trimEvents(events, maxEvents, endBlock);

    await withGlobalTransaction(async () => {
        await persistEvents(issuerId, events);
        await updateLastProcessed(issuerId, endBlock);
    }, dbConn);
};

const bootstrapTable = async (issuerId, deployedBlockNumber, contract, dbConn) => {
    // TODO: fix the copy-pasted query
    const issuerCreatedFilter = contract.filters.IssuerCreated;
    const issuerEvents = await contract.queryFilter(issuerCreatedFilter);
    if (issuerEvents.length === 0) {
        throw new Error(`No issuer events found!`);
    }
    const issuerCreatedEventId = issuerEvents[0].args[0];
    console.log("IssuerCreated Event Emitted!", issuerCreatedEventId);
    const tMinusOne = deployedBlockNumber - 1;
    
    await withGlobalTransaction(async () => {
        await verifyIssuerAndSeed(contract, issuerCreatedEventId);
        await updateLastProcessed(issuerId, tMinusOne);
    }, dbConn);

    return tMinusOne;
};

const persistEvents = async (issuerId, events) => {
    // Persist all the necessary changes for each event gathered in process events
    for (const event of events) {
        const txHandleFunc = txFuncs.get(event.type);
        console.log("persistEvent: ", event);
        if (txHandleFunc) {
            // @ts-ignore
            await txHandleFunc(event.data, issuerId, event.timestamp);
            continue;
        }
        const contractHandleFunc = contractFuncs.get(event.type);
        if (contractHandleFunc) {
            await contractHandleFunc(event.data);
            continue;
        }
        throw new Error(`Invalid transaction type: "${event.type}" for ${event}`);
    }
};

export const trimEvents = (events, maxEvents, endBlock) => {
    let index = 0;    
    while (index < maxEvents && index < events.length) {
        // Include the entire next block
        const includeBlock = events[index].blockNumber;
        index++;
        while (index < events.length && events[index].blockNumber === includeBlock) {
            index++;
        }
    }
    // Nothing to trim!
    if (index >= events.length) {
        return [events, endBlock];
    }
    // We processed up to the last events' blockNumber
    // `index` is *exclusive* when trimming
    const useEvents = [...events.slice(0, index)];
    return [useEvents, useEvents[useEvents.length - 1].blockNumber];
};


const updateLastProcessed = async (issuerId, lastProcessedBlock) => {
    return updateIssuerById(issuerId, {lastProcessedBlock});
};
