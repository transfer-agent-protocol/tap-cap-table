import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import StockIssuance from "../objects/transactions/issuance/StockIssuance.js";

export const updateIssuerById = async (id, updatedData) => {
    const issuer = await Issuer.findByIdAndUpdate(id, updatedData, { new: true });
    return issuer;
};

export const updateStakeholderById = async (id, updatedData) => {
    const stakeholder = await Stakeholder.findByIdAndUpdate(id, updatedData, { new: true });
    return stakeholder;
};

export const updateStockClassById = async (id, updatedData) => {
    const stockClass = await StockClass.findByIdAndUpdate(id, updatedData, { new: true });
    return stockClass;
};

export const updateStockLegendTemplateById = async (id, updatedData) => {
    const stockLegendTemplate = await StockLegendTemplate.findByIdAndUpdate(id, updatedData, { new: true });
    return stockLegendTemplate;
};

export const updateStockPlanById = async (id, updatedData) => {
    const stockPlan = await StockPlan.findByIdAndUpdate(id, updatedData, { new: true });
    return stockPlan;
};

export const updateValuationById = async (id, updatedData) => {
    const valuation = await Valuation.findByIdAndUpdate(id, updatedData, { new: true });
    return valuation;
};

export const updateVestingTermsById = async (id, updatedData) => {
    const vestingTerms = await VestingTerms.findByIdAndUpdate(id, updatedData, { new: true });
    return vestingTerms;
};

export const upsertStockIssuance= async (id, data) => {
    const issuer = await StockIssuance.findByIdAndUpdate(id, data, { new: true });
    return issuer;
};
