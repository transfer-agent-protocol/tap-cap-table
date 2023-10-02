import { actions, createMachine, spawn, stop } from "xstate";
import { stockMachine } from "./stock.js";
const { assign, raise } = actions;

export const parentMachine = createMachine(
    {
        id: "Parent",
        initial: "ready",
        context: {
            securities: {}, // This will store references to spawned child machines
            activePositions: {},
            activeSecurityIdsByStockClass: {},
            transactions: [],
        },
        predictableActionArguments: true,
        preserveActionOrder: true,
        states: {
            ready: {
                on: {
                    WAITING: {},
                    PRE_STOCK_ISSUANCE: {
                        actions: ["spawnSecurity"],
                    },
                    UPDATE_CONTEXT: {
                        actions: ["updateParentContext"],
                    },
                    STOP_CHILD: {
                        actions: ["stopChild"],
                    },
                    PRE_STOCK_TRANSFER: {
                        actions: ["createChildTransfer"],
                    },
                    PRE_STOCK_CANCELLATION: {
                        actions: ["preCancel"],
                    },
                },
            },
        },
    },
    {
        actions: {
            createChildTransfer: assign((context, event) => {
                const security_id = event.value.security_id;
                const resulting_security_ids = event.value.resulting_security_ids;
                const balance_security_id = event.value?.balance_security_id || null;

                const securityActor = context.securities[security_id];

                securityActor.send({
                    type: "TX_STOCK_TRANSFER",
                    security_id,
                    balance_security_id,
                    resulting_security_ids,
                });

                return {
                    transactions: [...context.transactions, event.value],
                };
            }),
            preCancel: assign((context, event) => {
                const { balance_security_id, quantity: quantityToBeRemoved } = event.value;
                const securityId = event.id;

                // Adam: think about verification:
                if (balance_security_id) {
                    // spawn new security with the balance security id and the
                }

                const securityActor = context.securities[security_id];

                securityActor.send({
                    type: "TX_STOCK_CANCELLATION",
                    security_id,
                    balance_security_id,
                });

                // spawn a new machine
                // where can I get the remianing quantity
                const cancelledTx = context.transactions.find((tx) => tx.security_id === securityId);
                const remainingQuantity = cancelledTx.quantity - quantityToBeRemoved;
                const value = {
                    ...tx,
                    quantity: remainingQuantity,
                };
                const newSecurity = spawn(stockMachine.withContext(value), balance_security_id);
                return {
                    securities: {
                        ...context.securities,
                        [securityId]: newSecurity,
                    },
                    transactions: [...context.transactions, value.value],
                };
            }),
            stopChild: assign((context, event) => {
                const { security_id, resulting_security_ids, balance_security_id } = event.value;

                const transferorIssuance = context.transactions.find((tx) => tx.security_id === security_id);
                const { stakeholder_id, stock_class_id } = transferorIssuance;

                delete context.securities[security_id];

                delete context.activePositions[stakeholder_id][security_id];

                context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id] = context.activeSecurityIdsByStockClass[stakeholder_id][
                    stock_class_id
                ].filter((el) => el !== security_id);

                delete context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id];

                stop(security_id);
                return { ...context };
            }),
            spawnSecurity: assign((context, event) => {
                console.log("inside spawnSecurity");

                const { value } = event;

                const securityId = event.id;
                const newSecurity = spawn(stockMachine.withContext(value), securityId);
                return {
                    securities: {
                        ...context.securities,
                        [securityId]: newSecurity,
                    },
                    transactions: [...context.transactions, value.value],
                };
            }),
            updateParentContext: assign({
                activePositions: (context, event) => {
                    // console.log("context to update parent ", context, "and event ", event);

                    const updatedActivePositions = { ...context.activePositions };

                    for (const stakeholderId in event.value.activePositions) {
                        if (updatedActivePositions[stakeholderId]) {
                            // If the stakeholderId already exists in the context, merge the securities
                            updatedActivePositions[stakeholderId] = {
                                ...updatedActivePositions[stakeholderId],
                                ...event.value.activePositions[stakeholderId],
                            };
                        } else {
                            // If the stakeholderId doesn't exist in the context, just add it
                            updatedActivePositions[stakeholderId] = event.value.activePositions[stakeholderId];
                        }
                    }

                    return updatedActivePositions;
                },
                activeSecurityIdsByStockClass: (context, event) => {
                    const updatedSecurityIdsByStockClass = {
                        ...context.activeSecurityIdsByStockClass,
                    };

                    for (const stakeholderId in event.value.activeSecurityIdsByStockClass) {
                        if (updatedSecurityIdsByStockClass[stakeholderId]) {
                            // If the stakeholderId already exists in the context, merge the stock classes
                            for (const stockClassId in event.value.activeSecurityIdsByStockClass[stakeholderId]) {
                                if (updatedSecurityIdsByStockClass[stakeholderId][stockClassId]) {
                                    // Merge the security IDs arrays
                                    updatedSecurityIdsByStockClass[stakeholderId][stockClassId] = [
                                        ...new Set([
                                            ...updatedSecurityIdsByStockClass[stakeholderId][stockClassId],
                                            ...event.value.activeSecurityIdsByStockClass[stakeholderId][stockClassId],
                                        ]),
                                    ];
                                } else {
                                    // If the stockClassId doesn't exist in the context for this stakeholder, just add it
                                    updatedSecurityIdsByStockClass[stakeholderId][stockClassId] =
                                        event.value.activeSecurityIdsByStockClass[stakeholderId][stockClassId];
                                }
                            }
                        } else {
                            // If the stakeholderId doesn't exist in the context, just add it
                            updatedSecurityIdsByStockClass[stakeholderId] = event.value.activeSecurityIdsByStockClass[stakeholderId];
                        }
                    }

                    return updatedSecurityIdsByStockClass;
                },
            }),
        },
    }
);
