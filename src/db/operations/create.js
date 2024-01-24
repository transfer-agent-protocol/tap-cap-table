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
import { save } from "./atomic.ts";

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

export const createHistoricalTransaction = (transactionHistoryData) => {
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
}
