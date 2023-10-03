import { interpret } from "xstate";
import { parentMachine } from "./parent.js";

import { preProcessorCache } from "../utils/caches.js";

/*
    @dev: Parent-Child machines are created to calculate current context then deleted.
    if we ever need then, consider saving them to the DB.
*/
const preProcessManifestTxs = (issuerId, txs) => {
    const parent = interpret(parentMachine);

    parent.start();

    txs.items.forEach((tx) => {
        console.log("tx ", tx.object_type);
        switch (tx.object_type) {
            case "TX_STOCK_ISSUANCE":
                parent.send({
                    type: "PRE_STOCK_ISSUANCE",
                    id: tx.security_id,
                    value: {
                        activePositions: {},
                        activeSecurityIdsByStockClass: {},
                        value: tx,
                    },
                });
                break;
            case "TX_STOCK_TRANSFER":
                parent.send({
                    type: "PRE_STOCK_TRANSFER",
                    id: tx.security_id,
                    value: tx,
                });
                break;
            case "TX_STOCK_CANCELLATION":
                parent.send({
                    type: "PRE_STOCK_CANCELLATION",
                    id: tx.security_id,
                    value: tx,
                });
                break;
            case "TX_STOCK_RETRACTION":
                parent.send({
                    type: "PRE_STOCK_RETRACTION",
                    id: tx.security_id,
                    value: tx,
                });
                break;
        }
    });

    console.log("parent context ", JSON.stringify(parent._state.context, null, 2))

    preProcessorCache[issuerId] = {
        activePositions: parent._state.context.activePositions,
        activeSecurityIdsByStockClass: parent._state.context.activeSecurityIdsByStockClass,
        transactions: parent._state.context.transactions,
    };
};

export default preProcessManifestTxs;
