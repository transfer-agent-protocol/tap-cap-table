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
    return Issuer.findByIdAndDelete(issuerId);
};

export const deleteStakeholderById = (stakeholderId) => {
    return Stakeholder.findByIdAndDelete(stakeholderId);
};

export const deleteStockClassById = (stockClassId) => {
    return StockClass.findByIdAndDelete(stockClassId);
};

export const deleteStockLegendTemplateById = (stockLegendTemplateId) => {
    return StockLegendTemplate.findByIdAndDelete(stockLegendTemplateId);
};

export const deleteStockPlanById = (stockPlanId) => {
    return StockPlan.findByIdAndDelete(stockPlanId);
};

export const deleteValuationById = (valuationId) => {
    return Valuation.findByIdAndDelete(valuationId);
};

export const deleteVestingTermsById = (vestingTermsId) => {
    return VestingTerms.findByIdAndDelete(vestingTermsId);
};

export const deleteTransactionById = (transactionId) => {
    return StockIssuance.findByIdAndDelete(transactionId);
};
