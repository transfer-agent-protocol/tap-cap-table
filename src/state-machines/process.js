import { interpret } from "xstate";
import { parentMachine } from "./parent.js";
import { preProcessorCache } from "../utils/caches.js";

/*
    @dev: Parent-Child machines are created to calculate current context then deleted.
    if we ever need them, consider saving them to the DB.

    TODO:
    - Adjustments - consider adding shares_issued and authorized to the machines

*/
const preProcessManifestTxs = (issuer, txs, stockClasses) => {
    const parent = interpret(parentMachine);

    parent.start();

    parent.send({
        type: "IMPORT_ISSUER",
        value: issuer,
    });

    stockClasses.items.forEach((stockClass) => {
        parent.send({
            type: "IMPORT_STOCK_CLASS",
            value: stockClass,
        });
    });

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

            case "TX_STOCK_REISSUANCE":
                parent.send({
                    type: "PRE_STOCK_REISSUANCE",
                    id: tx.security_id,
                    value: tx,
                });
                break;
            case "TX_STOCK_REPURCHASE":
                parent.send({
                    type: "PRE_STOCK_REPURCHASE",
                    id: tx.security_id,
                    value: tx,
                });
                break;
            case "TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT":
                parent.send({
                    type: "PRE_STOCK_CLASS_SHARES_ADJUSTMENT",
                    value: tx,
                });

                break;
            case "TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT":
                break;
        }
    });

    console.log("parent context ", JSON.stringify(parent._state.context, null, 2));

    preProcessorCache[issuer.id] = {
        activePositions: parent._state.context.activePositions,
        activeSecurityIdsByStockClass: parent._state.context.activeSecurityIdsByStockClass,
        transactions: parent._state.context.transactions,
        issuer: parent._state.context.issuer,
        stockClasses: parent._state.context.stockClasses,
    };
};

export default preProcessManifestTxs;

/*
struct Issuer {
    bytes16 id;
    string legal_name;
    uint256 shares_issued;
    uint256 shares_authorized;
}

// can be later extended to add things like seniority, conversion_rights, etc.
struct StockClass {
    bytes16 id;
    string class_type; // ["COMMON", "PREFERRED"]
    uint256 price_per_share; // Per-share price this stock class was issued for
    uint256 shares_issued;
    uint256 shares_authorized;
}

*/
