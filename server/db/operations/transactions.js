import * as Acceptance from "../objects/transactions/acceptance/index.js";
import * as Adjustment from "../objects/transactions/adjustment/index.js";
import * as Cancellation from "../objects/transactions/cancellation/index.js";
import * as Issuance from "../objects/transactions/issuance/index.js";
import * as Reissuance from "../objects/transactions/reissuance/index.js";
import * as Repurchase from "../objects/transactions/repurchase/index.js";
import * as Retraction from "../objects/transactions/retraction/index.js";
import * as Transfer from "../objects/transactions/transfer/index.js";
import { save } from "./atomic.ts";

const typeToModelType = {
    TX_STOCK_ACCEPTANCE: Acceptance.StockAcceptance,
    TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT: Adjustment.IssuerAuthorizedSharesAdjustment,
    TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT: Adjustment.StockClassAuthorizedSharesAdjustment,
    TX_STOCK_CANCELLATION: Cancellation.StockCancellation,
    TX_STOCK_ISSUANCE: Issuance.StockIssuance,
    TX_CONVERTIBLE_ISSUANCE: Issuance.ConvertibleIssuance,
    TX_EQUITY_COMPENSATION_ISSUANCE: Issuance.EquityCompensationIssuance,
    TX_STOCK_REISSUANCE: Reissuance.StockReissuance,
    TX_STOCK_REPURCHASE: Repurchase.StockRepurchase,
    TX_STOCK_RETRACTION: Retraction.StockRetraction,
    TX_STOCK_TRANSFER: Transfer.StockTransfer,
};

const addTransactions = async (inputTransactions, issuerId) => {
    for (let inputTransaction of inputTransactions.items) {
        inputTransaction = { ...inputTransaction, issuer: issuerId };
        const ModelType = typeToModelType[inputTransaction.object_type];
        if (ModelType) {
            const transaction = await save(new ModelType(inputTransaction));
            console.log(`${inputTransaction.object_type} transaction added. Details:`, JSON.stringify(transaction, null, 2));
        } else {
            console.log(`Unknown object type for transaction:`, JSON.stringify(inputTransaction, null, 2));
        }
    }
};

export default addTransactions;
