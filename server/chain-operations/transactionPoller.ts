import { AbiCoder, EventLog } from "ethers";
import { Connection } from "mongoose";
import pRetry, { Options as RetryOptions } from "p-retry";
import { connectDB } from "../db/config/mongoose.ts";
import { withGlobalTransaction } from "../db/operations/atomic.ts";
import { readAllIssuers } from "../db/operations/read.js";
import { updateIssuerById } from "../db/operations/update.js";
import { getIssuerContract } from "../utils/caches.ts";
import sleep from "../utils/sleep.js";
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

interface QueuedEvent {
    type: string;
    timestamp: Date;
    data: any;
    o: EventLog;
}

const contractFuncs = new Map([
    ["StakeholderCreated", handleStakeholder],
    ["StockClassCreated", handleStockClass],
]);

const txMapper = {
    1: [IssuerAuthorizedSharesAdjustment, handleIssuerAuthorizedSharesAdjusted],
    2: [StockClassAuthorizedSharesAdjustment, handleStockClassAuthorizedSharesAdjusted],
    3: [StockAcceptance, handleStockAcceptance],
    4: [StockCancellation, handleStockCancellation],
    5: [StockIssuance, handleStockIssuance],
    6: [StockReissuance, handleStockReissuance],
    7: [StockRepurchase, handleStockRepurchase],
    8: [StockRetraction, handleStockRetraction],
    9: [StockTransfer, handleStockTransfer],
};
// (idx => type name) derived from txMapper
export const txTypes = Object.fromEntries(
    // @ts-expect-error - Tuple destructuring with complex union types
    Object.entries(txMapper).map(([i, [, f]]) => [i, f.name.replace("handle", "")])
);
// (name => handler) derived from txMapper
export const txFuncs = Object.fromEntries(Object.entries(txMapper).map(([i, [, f]]) => [txTypes[i], f]));

// Globals enabling elegant poller process shutdown
let _keepProcessing = true;
let _finishedProcessing = false;

export const stopEventProcessing = async () => {
    _keepProcessing = false;
    while (!_finishedProcessing) {
        await sleep(50);
    }
};

export const pollingSleepTime = 20_000;

// Max number of issuers processed in parallel per cycle.
// The poller is slated to be replaced by a proper indexer, so this is the main (and only) tuning knob we keep.
const POLLER_MAX_CONCURRENCY = Number.parseInt(process.env.POLLER_MAX_CONCURRENCY || "5", 10) || 5;

interface IEventProcessing {
    finalizedOnly: boolean;
    useConn?: Connection;
}

export const startEventProcessing = async ({ finalizedOnly, useConn }: IEventProcessing) => {
    _keepProcessing = true;
    _finishedProcessing = false;

    const dbConn = useConn || (await connectDB());
    while (_keepProcessing) {
        const issuers = await readAllIssuers();
        const activeIssuers: any[] = issuers.filter((issuer: any) => issuer.deployed_to);

        console.log(`Processing for ${activeIssuers.length} issuers at ${Date()}`);

        await runWithConcurrency(activeIssuers, POLLER_MAX_CONCURRENCY, async (issuer: any) => {
            try {
                const { contract, provider, libraries } = await getIssuerContract(issuer);
                await processEvents(dbConn, contract, provider, issuer, libraries.txHelper, finalizedOnly);
            } catch (err) {
                console.error(`Poller error for issuer ${issuer._id}:`, err);
            }
        });

        await sleep(pollingSleepTime);
    }
    _finishedProcessing = true;
};

const getRetryOptions = (action: string, options?: RetryOptions): RetryOptions => {
    // https://github.com/sindresorhus/p-retry
    return {
        minTimeout: 10 * 1000,
        maxTimeout: 2 * 60 * 1000,
        retries: 5,
        onFailedAttempt: (error) => {
            console.error(`Error with ${action} (retrying shortly):`);
            console.error(error);
        },
        ...options,
    };
};

// maxBlocks is the per-cycle event-query window. Each cycle is bounded by `maxEvents` regardless,
// so a large window mostly helps drain a backlog quickly when the issuer is far behind chain head.
// 5000 is a pragmatic value for fast chains (e.g. Plume); the original 500 was leaving the poller
// stuck grinding through old blocks on busy networks.
const processEvents = async (dbConn, contract, provider, issuer, txHelper, finalizedOnly, maxBlocks = 5000, maxEvents = 250) => {
    /*
    We process up to `maxEvents` across `maxBlocks` to ensure our transaction sizes dont get too big and bog down our db
    */
    const { _id: issuerId, tx_hash: deployedTxHash } = issuer;
    let lastProcessedBlock = issuer.last_processed_block;
    console.log(`Processing for ${issuerId}: ${lastProcessedBlock}`); //, { lastProcessedBlock, deployedTxHash, latestBlock });
    const { number: latestBlock } = await pRetry(
        async () => provider.getBlock(finalizedOnly ? "finalized" : "latest"),
        getRetryOptions("provider.getBlock")
    );
    if (lastProcessedBlock === null) {
        const receipt = await pRetry(async () => provider.getTransactionReceipt(deployedTxHash), getRetryOptions("provider.getTransactionReceipt"));
        if (!receipt) {
            console.error("Deployment receipt not found");
            return;
        }
        if (receipt.blockNumber > latestBlock) {
            console.log("Deployment tx not finalized", { receipt, lastFinalizedBlock: latestBlock });
            return;
        }
        lastProcessedBlock = await issuerDeployed(issuerId, receipt, contract, dbConn);
    }
    const startBlock = lastProcessedBlock + 1;
    let endBlock = Math.min(startBlock + maxBlocks, latestBlock);
    if (startBlock >= endBlock) {
        return;
    }

    let events: QueuedEvent[] = [];

    const contractEvents: EventLog[] = await pRetry(
        async () => contract.queryFilter("*", startBlock, endBlock),
        getRetryOptions("contract.queryFilter")
    );

    for (const event of contractEvents) {
        const type = event?.fragment?.name;
        if (contractFuncs.has(type)) {
            const { timestamp } = await provider.getBlock(event.blockNumber);
            events.push({ type, timestamp, data: event.args[0], o: event });
        }
    }

    const txEvents: EventLog[] = await pRetry(
        async () => txHelper.queryFilter(txHelper.filters.TxCreated, startBlock, endBlock),
        getRetryOptions("txHelper.filters.TxCreated")
    );
    for (const event of txEvents) {
        if (event.removed) {
            continue;
        }
        const [, typeIdx, txData] = event.args;
        const [structType] = txMapper[typeIdx];
        const decodedData = abiCoder.decode([structType], txData);
        const { timestamp } = await provider.getBlock(event.blockNumber);
        events.push({ type: txTypes[typeIdx], timestamp, data: decodedData[0], o: event });
    }

    // Nothing to process
    if (events.length === 0) {
        await updateLastProcessed(issuerId, endBlock);
        return;
    }

    // Process only up to a certain amount
    [events, endBlock] = trimEvents(events, maxEvents, endBlock);

    await withGlobalTransaction(async () => {
        await persistEvents(issuerId, events);
        await updateLastProcessed(issuerId, endBlock);
    }, dbConn);
};

const issuerDeployed = async (issuerId, receipt, contract, dbConn) => {
    console.log("New issuer was deployed", { issuerId });
    const events = await contract.queryFilter(contract.filters.IssuerCreated);
    if (events.length === 0) {
        throw new Error(`No issuer events found!`);
    }
    const issuerCreatedEventId = events[0].args[0];
    console.log("IssuerCreated event captured!", { issuerCreatedEventId });
    const lastProcessedBlock = receipt.blockNumber - 1;
    await withGlobalTransaction(async () => {
        await verifyIssuerAndSeed(contract, issuerCreatedEventId);
        await updateLastProcessed(issuerId, lastProcessedBlock);
    }, dbConn);
    return lastProcessedBlock;
};

const persistEvents = async (issuerId, events: QueuedEvent[]) => {
    // Persist all the necessary changes for each event gathered in process events
    for (const event of events) {
        const { type, data, timestamp } = event;
        const txHandleFunc = txFuncs[type];
        if (txHandleFunc) {
            await txHandleFunc(data, issuerId, timestamp);
            continue;
        }
        const contractHandleFunc = contractFuncs.get(type);
        if (contractHandleFunc) {
            await contractHandleFunc(data);
            continue;
        }
        console.error("Invalid transaction type: ", type, event);
        throw new Error(`Invalid transaction type: "${type}"`);
    }
};

export const trimEvents = (origEvents: QueuedEvent[], maxEvents, endBlock) => {
    // Sort for correct execution order
    const events = [...origEvents];
    events.sort((a, b) => a.o.blockNumber - b.o.blockNumber || a.o.transactionIndex - b.o.transactionIndex || a.o.index - b.o.index);
    let index = 0;
    while (index < maxEvents && index < events.length) {
        // Include the entire next block
        const includeBlock = events[index].o.blockNumber;
        index++;
        while (index < events.length && events[index].o.blockNumber === includeBlock) {
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
    return [useEvents, useEvents[useEvents.length - 1].o.blockNumber];
};

const updateLastProcessed = async (issuerId, lastProcessedBlock) => {
    return updateIssuerById(issuerId, { last_processed_block: lastProcessedBlock });
};

async function runWithConcurrency<T>(items: T[], concurrency: number, worker: (item: T) => Promise<void>): Promise<void> {
    const queue = [...items];
    const runNext = async (): Promise<void> => {
        if (queue.length === 0) return;
        const item = queue.shift()!;
        try {
            await worker(item);
        } finally {
            await runNext();
        }
    };

    const actualConcurrency = Math.min(concurrency, items.length);
    const workers: Promise<void>[] = [];
    for (let i = 0; i < actualConcurrency; i++) {
        workers.push(runNext());
    }
    await Promise.all(workers);
}
