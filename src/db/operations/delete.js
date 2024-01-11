import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import StockIssuance from "../objects/transactions/issuance/StockIssuance.js";

// TODO: since we're doing a time series db that's meant to be immutable, is this needed?

export const deleteIssuerById = (issuerId) => {
    return findByIdAndDelete(Issuer, issuerId);
};

export const deleteStakeholderById = (stakeholderId) => {
    return findByIdAndDelete(Stakeholder, stakeholderId);
};

export const deleteStockClassById = (stockClassId) => {
    return findByIdAndDelete(StockClass, stockClassId);
};

export const deleteStockLegendTemplateById = (stockLegendTemplateId) => {
    return findByIdAndDelete(StockLegendTemplate, stockLegendTemplateId);
};

export const deleteStockPlanById = (stockPlanId) => {
    return findByIdAndDelete(StockPlan, stockPlanId);
};

export const deleteValuationById = (valuationId) => {
    return findByIdAndDelete(Valuation, valuationId);
};

export const deleteVestingTermsById = (vestingTermsId) => {
    return findByIdAndDelete(VestingTerms, vestingTermsId);
};

export const deleteTransactionById = (transactionId) => {
    return findByIdAndDelete(StockIssuance, transactionId);
};
