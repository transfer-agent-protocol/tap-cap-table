import { actions, createMachine, spawn, stop } from "xstate";
import { stockMachine } from "./stock.js";
const { assign, raise } = actions;

export const parentMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAUCGAnMA7ALgOk1QgE8BiAdQEEBJAFWoDkBxAbQAYBdRUABwHtYASxyC+WbiAAeiAIwB2AMx4ATAA4AnGzkA2VTPlsArOoAsAGhDFEqw2zwzltmQtUKT2j6oC+Xi2ky4BGBEZMgASgCiAPoAyrQA8gDCANJR1DExAKqUDIkR7FxIIPxCImIS0gj6qnh6jkbaciZsqrrqFlYIcoYmeGzuqqo6hjK6Iz5+GNj4hCSkmcgAIpS00YnxDKsAGrQFEiXCouJFlc696soyg-oDcq7KHYjahnJ46ro6MrdsCgoTIP5pkEQqQ4vFkFFEgAJagAGUWeyKBzKx1Ap2MeAUagcGg8XyGjwQhm0Mlqmm0CkMahel0M-0BgVmoUisQSKSitDCORiADEImFEbwBIdyidZPI3qoTC5DFLnBc1IT3IZag5bOoZGxlIp1HJ6VNGcE5uFomD2YkcnlYbCVtQNoLisKURVEOp1HhundLvIZJoTPpCQptO7FNLVMoNbqXup9QEZkbmaa2alIpzKIl6PbOPsnUcXVU2O7+rprq5ul9CdqlM9tI5GkG5J9Y0CmaQTaykqlEjaMrEoZRIjEopRFgApTJxACyEU2DuRebFCBMD0sskbeBeegURkMCjkpm1zcNIPbZpTEXSWUt+WzSNzorRskLmOlOjU4ZljkJeg3bD--T3FoHHcHxfBALA+AgOAJAZHAc1KBdHwQABabRCVQo94xCeCRVRKRZCGFQ6gpFo7j-NDVwQTQVVrWxCyDHoem0UCvCAA */
        id: "Parent",
        initial: "ready",
        context: {
            securities: {}, // This will store references to spawned child machines
            activePositions: {},
            activeSecurityIdsByStockClass: {},
            issuer: {},
            stockClasses: {},
            transactions: [],
        },
        predictableActionArguments: true,
        preserveActionOrder: true,
        states: {
            ready: {
                on: {
                    WAITING: {},
                    IMPORT_ISSUER: {
                        actions: ["importIssuer"],
                    },
                    IMPORT_STOCK_CLASS: {
                        actions: ["importStockClass"],
                    },
                    PRE_STOCK_ISSUANCE: {
                        actions: ["spawnSecurity"],
                    },
                    PRE_STOCK_TRANSFER: {
                        actions: ["preTransfer"],
                    },
                    PRE_STOCK_CANCELLATION: {
                        actions: ["preCancel"],
                    },
                    PRE_STOCK_RETRACTION: {
                        actions: ["preRetract"],
                    },
                    PRE_STOCK_REISSUANCE: {
                        actions: ["preReissuance"],
                    },
                    PRE_STOCK_REPURCHASE: {
                        actions: ["preRepurchase"],
                    },
                    PRE_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT: {
                        actions: ["updateStockClassShares"],
                    },
                    PRE_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT: {
                        actions: ["updateIssuerShares"],
                    },
                    UPDATE_CONTEXT: {
                        actions: ["updateParentContext"],
                    },
                    STOP_CHILD: {
                        actions: ["stopChild"],
                    },
                },
            },
        },
    },
    {
        actions: {
            importIssuer: assign((_, event) => {
                const initial_shares_authorized = event.value.initial_shares_authorized || 0;

                return {
                    issuer: {
                        shares_authorized: initial_shares_authorized,
                        shares_issued: 0,
                    },
                };
            }),
            importStockClass: assign((context, event) => {
                const initial_shares_authorized = event.value.initial_shares_authorized || 0;
                const { id } = event.value;

                return {
                    stockClasses: { ...context.stockClasses, [id]: { shares_authorized: initial_shares_authorized, shares_issued: 0 } },
                };
            }),
            preTransfer: assign((context, event) => {
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
                const currentTransaction = event.value;
                const { security_id } = currentTransaction;

                const securityActor = context.securities[security_id];

                securityActor.send({
                    type: "TX_STOCK_CANCELLATION",
                    security_id,
                });

                return {
                    transactions: [...context.transactions, currentTransaction],
                };
            }),
            preRetract: assign((context, event) => {
                const currentTransaction = event.value;
                const { security_id } = currentTransaction;

                const securityActor = context.securities[security_id];

                securityActor.send({
                    type: "TX_STOCK_RETRACTION",
                    security_id,
                });

                return {
                    transactions: [...context.transactions, currentTransaction],
                };
            }),
            preRepurchase: assign((context, event) => {
                const currentTransaction = event.value;
                const { security_id } = currentTransaction;

                const securityActor = context.securities[security_id];

                securityActor.send({
                    type: "TX_STOCK_REPURCHASE",
                    security_id,
                });

                return {
                    transactions: [...context.transactions, currentTransaction],
                };
            }),
            preReissuance: assign((context, event) => {
                const currentTransaction = event.value;
                const { security_id } = currentTransaction;

                const securityActor = context.securities[security_id];

                securityActor.send({
                    type: "TX_STOCK_REISSUANCE",
                    security_id,
                });

                return {
                    transactions: [...context.transactions, currentTransaction],
                };
            }),
            stopChild: assign((context, event) => {
                const { security_id } = event.value;

                const transferorIssuance = context.transactions.find((tx) => tx.security_id === security_id);
                const { stakeholder_id, stock_class_id } = transferorIssuance;

                delete context.securities[security_id];

                delete context.activePositions[stakeholder_id][security_id];

                const activeSecuritiesByStockClass = context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id].filter(
                    (el) => el !== security_id
                );

                context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id] = activeSecuritiesByStockClass;

                if (activeSecuritiesByStockClass.length == 0) {
                    delete context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id];
                }

                stop(security_id);
                return { ...context };
            }),
            spawnSecurity: assign((context, event) => {
                const { value } = event;

                // check if stock_class_id is in context
                if (!context.stockClasses[value.value.stock_class_id]) {
                    throw Error("stock class not in context");
                }

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
            updateIssuerShares: assign({
                issuer: (context, event) => {
                    // sum all stockClasses  {[stock_class_id]: quantity}}
                    const quantityPerStockClass = sumQuantitiesByStockClass(context.activePositions);
                    const shares_issued = Object.values(quantityPerStockClass).reduce((total, quantity) => total + quantity, 0);
                    if (event.value.new_shares_authorized && event.value.new_shares_authorized <= shares_issued) {
                        throw Error(`New Issuer shares authorized must be larger than current shares authorized: shares Authorized \
                        ${event.value.new_shares_authorized} - Shares Issued: ${shares_issued} `);
                    }
                    return {
                        shares_authorized: event.value.new_shares_authorized || context.issuer.shares_authorized,
                        shares_issued,
                    };
                },
            }),
            updateStockClassShares: assign({
                stockClasses: (context, event) => {
                    const quantityPerStockClass = sumQuantitiesByStockClass(context.activePositions);
                    const stock_class_id = event.value.stock_class_id;
                    const shares_issued = quantityPerStockClass[stock_class_id];

                    if (
                        event.value.new_shares_authorized &&
                        event.value.new_shares_authorized <= context.stockClasses[stock_class_id].shares_authorized
                    ) {
                        throw Error(`New Stock Class shares authorized must be larger than current shares authorized: shares Authorized \
                        ${event.value.new_shares_authorized} - Shares Issued: ${shares_issued} `);
                    }
                    return {
                        ...context.stockClasses,
                        [stock_class_id]: {
                            shares_authorized: event.value.new_shares_authorized || context.stockClasses[stock_class_id].shares_authorized,
                            shares_issued,
                        },
                    };
                },
            }),
            updateParentContext: assign({
                activePositions: (context, event) => {
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

function sumQuantitiesByStockClass(activePositions) {
    return Object.keys(activePositions).reduce((result, stakeholderId) => {
        const positions = activePositions[stakeholderId];

        Object.keys(positions).forEach((positionId) => {
            const position = positions[positionId];
            const stockClassId = position.stock_class_id;

            if (!result[stockClassId]) {
                result[stockClassId] = 0;
            }

            result[stockClassId] += parseInt(position.quantity, 10);
        });

        return result;
    }, {});
}
