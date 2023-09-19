import { interpret } from "xstate";
import { parentMachine } from "./parent.js";
import txs from "../db/samples/notPoet/Transactions.ocf.json" assert { type: "json" };

const parent = interpret(parentMachine);

parent.subscribe((state) => {
    console.log("Securities ", state.context.securities);
    console.log("ActivePositions ", state.context.activePositions);
    console.log("ActiveSecurityIdsByStockClass ", state.context.activeSecurityIdsByStockClass);
    console.log("Transactions ", state.context.transactions);
});
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
