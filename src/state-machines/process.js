import { interpret } from "xstate";
import { parentMachine } from "./parent.js";

import { preProcessorCache } from "../utils/caches.js";

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
        }
    });

    console.log("parent context ", parent._state.context);

    preProcessorCache[issuerId] = {
        activePositions: parent._state.context.activePositions,
        activeSecurityIdsByStockClass: parent._state.context.activeSecurityIdsByStockClass,
    };
};

export default preProcessManifestTxs;
