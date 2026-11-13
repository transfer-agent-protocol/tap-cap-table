import Factory from "../objects/Factory.js";
import HistoricalTransaction from "../objects/HistoricalTransaction.js";
import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import ConvertibleIssuance from "../objects/transactions/issuance/ConvertibleIssuance.js";
import EquityCompensationIssuance from "../objects/transactions/issuance/EquityCompensationIssuance.js";
import { findOne, save } from "./atomic.ts";

/**
 * Routes build OCF objects with `id`, the same id they send onchain. Mongoose ignores `id`,
 * so without this the schema default would save the row under a different random _id.
 */
const saveNew = (Model, data) => save(new Model(data?.id && data._id == null ? { ...data, _id: data.id } : data));

export const createIssuer = (issuerData) => {
    return saveNew(Issuer, issuerData);
};

export const createStakeholder = (stakeholderData) => {
    return saveNew(Stakeholder, stakeholderData);
};

export const createStockClass = (stockClassData) => {
    return saveNew(StockClass, stockClassData);
};

export const createStockLegendTemplate = (stockLegendTemplateData) => {
    return saveNew(StockLegendTemplate, stockLegendTemplateData);
};

export const createStockPlan = (stockPlanData) => {
    return saveNew(StockPlan, stockPlanData);
};

export const createValuation = (valuationData) => {
    return saveNew(Valuation, valuationData);
};

export const createVestingTerms = (vestingTermsData) => {
    return saveNew(VestingTerms, vestingTermsData);
};

/**
 * Idempotent: replaying poller events (reindex) must not duplicate history rows.
 * If we re-see the same event with a tx_hash, fill it in on the existing row.
 */
export const createHistoricalTransaction = async (transactionHistoryData) => {
    const existing = await findOne(HistoricalTransaction, {
        transaction: transactionHistoryData.transaction,
        issuer: transactionHistoryData.issuer,
    });
    if (existing) {
        if (transactionHistoryData.tx_hash && !existing.tx_hash) {
            existing.tx_hash = transactionHistoryData.tx_hash;
            return existing.save();
        }
        return existing;
    }
    return save(new HistoricalTransaction(transactionHistoryData));
};

export const createEquityCompensationIssuance = (issuanceData) => {
    return saveNew(EquityCompensationIssuance, issuanceData);
};

export const createConvertibleIssuance = (issuanceData) => {
    return saveNew(ConvertibleIssuance, issuanceData);
};

export const createFactory = (factoryData) => {
    return saveNew(Factory, factoryData);
};
