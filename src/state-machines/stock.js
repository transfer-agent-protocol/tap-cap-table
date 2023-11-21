import { actions, createMachine } from "xstate";
const { sendParent, raise } = actions;

export const stockMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QGUAuB7AxgawHRoEMA7CAIwE8BiAFQA0B9ZageQGEBpegSWWQFUAggDlWAUQDaABgC6iUAAd0sAJapl6InJAAPRACZJk3AE4AbAA4A7ABZLkgKzW9ARlNuANCHKJze3KYBmST09a3s9S2M9U2trAF84zzQsPC5YWABXSBoGJjZOagAlYWQAMVFCqVkkEEUVNQ0tXQR7e2NcPXNnZ3NTSXNrKIHPbwQXANxLe0NnYzC+gIt7BKSMHFw0zOy6RhYOelZhMQAZY4FqLmYhKq061XVNGubW9s7u3v7BzusRxACXSbTSRhYLGSyWUwrEDJdabLIQHK7fL0QqiIoCVgXK43Gp3BqPUDPNodLo9PoDIY-LyIZwOQEzYGhPSOazOKEw1LpeGIvL7VE8fhHCQyW5Ke6NJ6IF4k97kr7DakIJztKaGMKRBzmQwBdlrTlbBE7XmcVEABT4hVYAAkBMhhdUFGL8U0pcS3mTPpTfi0ApZ6ZJnAFrKYbHZIVCiOgIHAtBzRfUHi6EABaUze1O4QxZ7M5yy6lL4VDEMijR0JiWExBOb3Gey4ezmAJB4GSSy06xWfOwrmQePigk6KsRDo9SwhWaOSTGZze7rtfpN6yMkJg31dvCsYiYMAAGx3vdxTsTkoQvjrkgC3TsS+Z0WM3r0YPrWYCrVpcyi69whTAqAATgQmCoAeZb9kmZ6ZpezjXsE4SmPeipdM+2bGA4TgQmyiTQnq35gMoPYQH2zonhBF5Xi2t7wd6S51kCF6mBE0H2P8OpYRyuDUABRCwAAZmAf5-iBtRHhWg6nsykHkTecEIaMPTtHRPQGF05gDF+P7yBkf6YAAFgQsBCXix6VuJ55QTBlGyVKgbIRedj-K0lisQkQA */
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
                    TX_STOCK_CANCELLATION: {
                        target: "Cancelled",
                    },
                    TX_STOCK_RETRACTION: {
                        target: "Retracted",
                    },
                    TX_STOCK_REISSUANCE: {
                        target: "Reissued",
                    },
                    TX_STOCK_REPURCHASE: {
                        target: "Repurchased",
                    },
                },
            },
            Cancelled: {
                type: "final",
                entry: ["stopChild"],
            },
            Retracted: {
                type: "final",
                entry: ["stopChild"],
            },
            Reissued: {
                type: "final",
                entry: ["stopChild"],
            },
            Transferred: {
                type: "final",
                entry: ["stopChild"],
            },
            Repurchased: {
                type: "final",
                entry: ["stopChild"],
            },
        },
    },
    {
        actions: {
            issue: (context, event) => updateContext(context, event.value),
            sendBackToParent: sendParent((context, event) => {
                return {
                type: "UPDATE_CONTEXT",
                value: {
                    activePositions: context.activePositions,
                    activeSecurityIdsByStockClass: context.activeSecurityIdsByStockClass,
                    stock_class_id: context.value.stock_class_id
                },
            }}),
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

// Creates activePosition and activeSecurityIdsByStockClass
const updateContext = (context, _) => {
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
