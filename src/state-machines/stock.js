import { actions, createMachine } from "xstate";
const { sendParent, raise } = actions;

export const stockMachine = createMachine(
    {
        id: "Stock",
        initial: "Standby",
        context: {
            value: {},
            activePositions: {},
            activeSecurityIdsByStockClass: {},
        },
        predictableActionArguments: true,
        preserveActionOrder: true,
        states: {
            Standby: {
                entry: raise(() => ({ type: "TX_STOCK_ISSUANCE" })),
                on: {
                    TX_STOCK_ISSUANCE: {
                        target: "Issued",
                        actions: ["issue", "sendBackToParent"],
                    },
                },
            },
            Issued: {
                on: {
                    TX_STOCK_TRANSFER: {
                        target: "Transferred",
                    },
                },
            },
            Transferred: {
                type: "final",
                entry: ["stopChild"],
            },
        },
    },
    {
        actions: {
            issue: (context, event) => updateContext(context, event.value),
            sendBackToParent: sendParent((context, event) => ({
                type: "UPDATE_CONTEXT",
                value: {
                    activePositions: context.activePositions,
                    activeSecurityIdsByStockClass: context.activeSecurityIdsByStockClass,
                },
            })),
            stopChild: sendParent((context, event) => {
                const { security_id, resulting_security_ids, balance_security_id } = event;
                return {
                    type: "STOP_CHILD",
                    value: {
                        security_id,
                        resulting_security_ids,
                        balance_security_id,
                    },
                };
            }),
        },
    }
);

const updateContext = (context, _) => {
    // console.log("context inside of updateContext ", context);
    const { stakeholder_id, stock_class_id, security_id, quantity, share_price, date } = context.value;

    //Update Active Positions
    // if active position is empty for this stakeholder, create it
    if (!context.activePositions[stakeholder_id]) {
        context.activePositions[stakeholder_id] = {};
    }
    context.activePositions[stakeholder_id][security_id] = {
        stock_class_id,
        quantity,
        share_price,
        timestamp: date,
    };

    // Update Security ID indexer
    if (!context.activeSecurityIdsByStockClass[stakeholder_id]) {
        context.activeSecurityIdsByStockClass[stakeholder_id] = {};
    }

    if (!context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id]) {
        context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id] = [];
    }

    context.activeSecurityIdsByStockClass[stakeholder_id][stock_class_id].push(security_id);
};
