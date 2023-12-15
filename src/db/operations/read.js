import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import HistoricalTransaction from "../objects/HistoricalTransaction.js";
import StockIssuance from "../objects/transactions/issuance/StockIssuance.js";
import StockTransfer from "../objects/transactions/transfer/StockTransfer.js";
import Factory from "../objects/Factory.js";

// READ By ID
export const readIssuerById = async (id) => {
    const issuer = await Issuer.findById(id);
    return issuer;
};

export const readStakeholderById = async (id) => {
    const stakeholder = await Stakeholder.findById(id);
    return stakeholder;
};

export const readStockClassById = async (id) => {
    const stockClass = await StockClass.findById(id);
    return stockClass;
};

export const readStockLegendTemplateById = async (id) => {
    const stockLegendTemplate = await StockLegendTemplate.findById(id);
    return stockLegendTemplate;
};

export const readStockPlanById = async (id) => {
    const stockPlan = await StockPlan.findById(id);
    return stockPlan;
};

export const readValuationById = async (id) => {
    const valuation = await Valuation.findById(id);
    return valuation;
};

export const readVestingTermsById = async (id) => {
    const vestingTerms = await VestingTerms.findById(id);
    return vestingTerms;
};

export const readHistoricalTransactionByIssuerId = async (issuerId) => {
    const historicalTransactions = await HistoricalTransaction.find({ issuer: issuerId }).populate("transaction");
    return historicalTransactions;
};

// COUNT
export const countIssuers = async () => {
    const totalIssuers = await Issuer.countDocuments();
    return totalIssuers;
};

export const countStakeholders = async () => {
    const totalStakeholders = await Stakeholder.countDocuments();
    return totalStakeholders;
};

export const countStockClasses = async () => {
    const totalStockClasses = await StockClass.countDocuments();
    return totalStockClasses;
};

export const countStockLegendTemplates = async () => {
    const totalTemplates = await StockLegendTemplate.countDocuments();
    return totalTemplates;
};

export const countStockPlans = async () => {
    const totalStockPlans = await StockPlan.countDocuments();
    return totalStockPlans;
};

export const countValuations = async () => {
    const totalValuations = await Valuation.countDocuments();
    return totalValuations;
};

export const countVestingTerms = async () => {
    const totalVestingTerms = await VestingTerms.countDocuments();
    return totalVestingTerms;
};

export const getAllIssuerDataById = async (issuerId) => {
    const issuerStakeholders = await Stakeholder.find({ issuer: issuerId });
    const issuerStockClasses = await StockClass.find({ issuer: issuerId });
    const issuerStockIssuances = await StockIssuance.find({ issuer: issuerId });
    const issuerStockTransfers = await StockTransfer.find({ issuer: issuerId });

    return {
        stakeholders: issuerStakeholders,
        stockClasses: issuerStockClasses,
        stockIssuances: issuerStockIssuances,
        stockTransfers: issuerStockTransfers,
    };
};

export const readAllIssuers = async () => {
    const issuers = await Issuer.find();
    return issuers;
}

export const readFactory = async () => {
    const factory = await Factory.find();
    return factory;
}