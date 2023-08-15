import * as Acceptance from "../objects/transactions/acceptance/index.js";
import * as Adjustment from "../objects/transactions/adjustment/index.js";
import * as Cancellation from "../objects/transactions/cancellation/index.js";
import * as Conversion from "../objects/transactions/conversion/index.js";
import * as Issuance from "../objects/transactions/issuance/index.js";
import * as Release from "../objects/transactions/release/index.js";
import * as Repurchase from "../objects/transactions/repurchase/index.js";
import * as Retraction from "../objects/transactions/retraction/index.js";
import * as Reissuance from "../objects/transactions/reissuance/index.js";
import * as Transfer from "../objects/transactions/transfer/index.js";
import * as Vesting from "../objects/transactions/vesting/index.js";
// TODO ... COMPLETE transaction imports ...

const typeToModelType = {
    // Acceptance
    TX_CONVERTIBLE_ACCEPTANCE: Acceptance.ConvertibleAcceptance,
    TX_EQUITY_COMPENSATION_ACCEPTANCE: Acceptance.EquityCompensationAcceptance,
    TX_PLAN_SECURITY_ACCEPTANCE: Acceptance.PlanSecurityAcceptance,
    TX_STOCK_ACCEPTANCE: Acceptance.StockAcceptance,
    TX_WARRANT_ACCEPTANCE: Acceptance.WarrantAcceptance,
    // Adjustment
    TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT: Adjustment.IssuerAuthorizedSharesAdjustment,
    TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT: Adjustment.StockClassAuthorizedSharesAdjustment,
    TX_STOCK_CLASS_CONVERSION_RATIO_ADJUSTMENT: Adjustment.StockClassConversionRatioAdjustment,
    TX_STOCK_PLAN_POOL_ADJUSTMENT: Adjustment.StockPlanPoolAdjustment,
    // Cancellation
    TX_CONVERTIBLE_CANCELLATION: Cancellation.ConvertibleCancellation,
    // TODO ... other cancellation mappings ...

    // Conversion
    TX_STOCK_CONVERSION: Conversion.StockConversion,
    // TODO ... other conversion mappings ...

    // Issuance
    TX_STOCK_ISSUANCE: Issuance.StockIssuance,
    // TODO ... other issuance mappings ...

    // Release
    TX_EQUITY_COMPENSATION_RELEASE: Release.EquityCompensationRelease,
    // ... other release mappings ...

    // Repurchase
    TX_STOCK_REPURCHASE: Repurchase.StockRepurchase,
    // ... other repurchase mappings ...

    // Retraction
    TX_STOCK_RETRACTION: Retraction.StockRetraction,
    // ... other retraction mappings ...

    // Reissuance
    TX_STOCK_REISSUANCE: Reissuance.StockReissuance,
    // ... other reissuance mappings ...
    TX_CONVERTIBLE_TRANSFER: Transfer.ConvertibleTransfer,
    TX_EQUITY_COMPENSATION_TRANSFER: Transfer.EquityCompensationTransfer,
    TX_PLAN_SECURITY_TRANSFER: Transfer.PlanSecurityTransfer,
    TX_STOCK_TRANSFER: Transfer.StockTransfer,
    TX_WARRANT_TRANSFER: Transfer.WarrantTransfer,
    // ... other mappings ...

    // Vesting
    TX_VESTING_ACCELERATION: Vesting.VestingAcceleration,
    // ... other vesting mappings ...
};

const addTransactions = async (inputTransactions) => {
    if (inputTransactions.file_type === "OCF_TRANSACTIONS_FILE") {
        for (const inputTransaction of inputTransactions.items) {
            const ModelType = typeToModelType[inputTransaction.object_type];
            if (ModelType) {
                const transaction = await new ModelType(inputTransaction).save();
                console.log(`${inputTransaction.object_type} transaction added. Details:`, JSON.stringify(transaction, null, 2));
            } else {
                console.log(`Unknown object type for transaction:`, JSON.stringify(inputTransaction, null, 2));
            }
        }
    }
};

export default addTransactions;
