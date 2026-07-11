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
import StockIssuance from "../objects/transactions/issuance/StockIssuance.js";
import StockTransfer from "../objects/transactions/transfer/StockTransfer.js";
import { findOne, save } from "./atomic.ts";

export const createIssuer = (issuerData) => {
    return save(new Issuer(issuerData));
};

export const createStakeholder = (stakeholderData) => {
    return save(new Stakeholder(stakeholderData));
};

export const createStockClass = (stockClassData) => {
    return save(new StockClass(stockClassData));
};

export const createStockLegendTemplate = (stockLegendTemplateData) => {
    return save(new StockLegendTemplate(stockLegendTemplateData));
};

export const createStockPlan = (stockPlanData) => {
    return save(new StockPlan(stockPlanData));
};

export const createValuation = (valuationData) => {
    return save(new Valuation(valuationData));
};

export const createVestingTerms = (vestingTermsData) => {
    return save(new VestingTerms(vestingTermsData));
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

export const createStockIssuance = (stockIssuanceData) => {
    return save(new StockIssuance(stockIssuanceData));
};

export const createEquityCompensationIssuance = (issuanceData) => {
    return save(new EquityCompensationIssuance(issuanceData));
};

export const createConvertibleIssuance = (issuanceData) => {
    return save(new ConvertibleIssuance(issuanceData));
};

export const createStockTransfer = (stockTransferData) => {
    return save(new StockTransfer(stockTransferData));
};

export const createFactory = (factoryData) => {
    return save(new Factory(factoryData));
};
