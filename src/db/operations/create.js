import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import StockIssuance from "../objects//transactions/issuance/StockIssuance.js";

export const createIssuer = (issuerData) => {
    const issuer = new Issuer(issuerData);
    return issuer.save();
};

export const createStakeholder = (stakeholderData) => {
    const stakeholder = new Stakeholder(stakeholderData);
    return stakeholder.save();
};

export const createStockClass = (stockClassData) => {
    const stockClass = new StockClass(stockClassData);
    return stockClass.save();
};

export const createStockLegendTemplate = (stockLegendTemplateData) => {
    const stockLegendTemplate = new StockLegendTemplate(stockLegendTemplateData);
    return stockLegendTemplate.save();
};

export const createStockPlan = (stockPlanData) => {
    const stockPlan = new StockPlan(stockPlanData);
    return stockPlan.save();
};

export const createValuation = (valuationData) => {
    const valuation = new Valuation(valuationData);
    return valuation.save();
};

export const createVestingTerms = (vestingTermsData) => {
    const vestingTerms = new VestingTerms(vestingTermsData);
    return vestingTerms.save();
};

export const createStockIssuance = (stockIssuanceData) => {
    const stockIssuance = new StockIssuance(stockIssuanceData);
    return stockIssuance.save();
};