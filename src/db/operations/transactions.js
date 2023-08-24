import * as Acceptance from "../objects/transactions/acceptance/index.js";
import * as Adjustment from "../objects/transactions/adjustment/index.js";
import * as Cancellation from "../objects/transactions/cancellation/index.js";
import * as Exercise from "../objects/transactions/exercise/index.js";
import * as Conversion from "../objects/transactions/conversion/index.js";
import * as Issuance from "../objects/transactions/issuance/index.js";
import * as Reissuance from "../objects/transactions/reissuance/index.js";
import * as Release from "../objects/transactions/release/index.js";
import * as Repurchase from "../objects/transactions/repurchase/index.js";
import * as Retraction from "../objects/transactions/retraction/index.js";
import * as ReturnToPool from "../objects/transactions/return_to_pool/index.js";
import * as Split from "../objects/transactions/split/index.js";
import * as Transfer from "../objects/transactions/transfer/index.js";
import * as Vesting from "../objects/transactions/vesting/index.js";

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
    TX_EQUITY_COMPENSATION_CANCELLATION: Cancellation.EquityCompensationCancellation,
    TX_PLAN_SECURITY_CANCELLATION: Cancellation.PlanSecurityCancellation,
    TX_STOCK_CANCELLATION: Cancellation.StockCancellation,
    TX_WARRANT_CANCELLATION: Cancellation.WarrantCancellation,

    // Conversion
    TX_STOCK_CONVERSION: Conversion.StockConversion,
    TX_CONVERTIBLE_CONVERSION: Conversion.ConvertibleConversion,

    // Exercise
    TX_EQUITY_COMPENSATION_EXERCISE: Exercise.EquityCompensationExercise,
    TX_PLAN_SECURITY_EXERCISE: Exercise.PlanSecurityExercise,
    TX_WARRANT_EXERCISE: Exercise.WarrantExercise,

    // Issuance
    TX_STOCK_ISSUANCE: Issuance.StockIssuance,
    TX_CONVERTIBLE_ISSUANCE: Issuance.ConvertibleIssuance,
    TX_EQUITY_COMPENSATION_ISSUANCE: Issuance.EquityCompensationIssuance,
    TX_PLAN_SECURITY_ISSUANCE: Issuance.PlanSecurityIssuance,
    TX_WARRANT_ISSUANCE: Issuance.WarrantIssuance,

    // Reiussuance
    TX_STOCK_REISSUANCE: Reissuance.StockReissuance,

    // Release
    TX_EQUITY_COMPENSATION_RELEASE: Release.EquityCompensationRelease,
    TX_PLAN_SECURITY_RELEASE: Release.PlanSecurityRelease,

    // Repurchase
    TX_STOCK_REPURCHASE: Repurchase.StockRepurchase,

    // Retraction
    TX_STOCK_RETRACTION: Retraction.StockRetraction,
    TX_CONVERTIBLE_RETRACTION: Retraction.ConvertibleRetraction,
    TX_EQUITY_COMPENSATION_RETRACTION: Retraction.EquityCompensationRetraction,
    TX_PLAN_SECURITY_RETRACTION: Retraction.PlanSecurityRetraction,
    TX_WARRANT_RETRACTION: Retraction.WarrantRetraction,

    // Return to Pool
    TX_STOCK_PLAN_RETURN_TO_POOL: ReturnToPool.StockPlanReturnToPool,

    // Split
    TX_STOCK_CLASS_SPLIT: Split.StockClassSplit,

    // Transfer
    TX_CONVERTIBLE_TRANSFER: Transfer.ConvertibleTransfer,
    TX_EQUITY_COMPENSATION_TRANSFER: Transfer.EquityCompensationTransfer,
    TX_PLAN_SECURITY_TRANSFER: Transfer.PlanSecurityTransfer,
    TX_STOCK_TRANSFER: Transfer.StockTransfer,
    TX_WARRANT_TRANSFER: Transfer.WarrantTransfer,

    // Vesting
    TX_VESTING_ACCELERATION: Vesting.VestingAcceleration,
    TX_VESTING_EVENT: Vesting.VestingEvent,
    TX_VESTING_START: Vesting.VestingStart,
};

const addTransactions = async (inputTransactions, issuerId) => {
    if (inputTransactions.file_type === "OCF_TRANSACTIONS_FILE") {
        for (let inputTransaction of inputTransactions.items) {
            inputTransaction = { ...inputTransaction, issuer: issuerId };
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
export { typeToModelType }; // Export the typeToModelType object to delete all transactions using the deseed script
