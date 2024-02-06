import Factory from "../objects/Factory.js";
import HistoricalTransaction from "../objects/HistoricalTransaction.js";
import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import StockIssuance from "../objects/transactions/issuance/StockIssuance.js";
import StockTransfer from "../objects/transactions/transfer/StockTransfer.js";
import { countDocuments, find, findById } from "./atomic.ts";

// READ By ID
export const readIssuerById = async (id) => {
    return await findById(Issuer, id);
};

export const readStakeholderById = async (id) => {
    return await findById(Stakeholder, id);
};

export const readStakeholderByIssuerAssignedId = async (id) => {
    return await find(Stakeholder, { issuerAssignedId: id }).populate("transaction");
};

export const readStockClassById = async (id) => {
    return await findById(StockClass, id);
};

export const readStockLegendTemplateById = async (id) => {
    return await findById(StockLegendTemplate, id);
};

export const readStockPlanById = async (id) => {
    return await findById(StockPlan, id);
};

export const readValuationById = async (id) => {
    return await findById(Valuation, id);
};

export const readVestingTermsById = async (id) => {
    return await findById(VestingTerms, id);
};

// READ Multiple
export const readHistoricalTransactionByIssuerId = async (issuerId) => {
    return await find(HistoricalTransaction, { issuer: issuerId }).populate("transaction");
};

// COUNT
export const countIssuers = async () => {
    return await countDocuments(Issuer);
};

export const countStakeholders = async () => {
    return await countDocuments(Stakeholder);
};

export const countStockClasses = async () => {
    return await countDocuments(StockClass);
};

export const countStockLegendTemplates = async () => {
    return await countDocuments(StockLegendTemplate);
};

export const countStockPlans = async () => {
    return await countDocuments(StockPlan);
};

export const countValuations = async () => {
    return await countDocuments(Valuation);
};

export const countVestingTerms = async () => {
    return await countDocuments(VestingTerms);
};

export const getAllIssuerDataById = async (issuerId) => {
    const issuerStakeholders = await find(Stakeholder, { issuer: issuerId });
    const issuerStockClasses = await find(StockClass, { issuer: issuerId });
    const issuerStockIssuances = await find(StockIssuance, { issuer: issuerId });
    const issuerStockTransfers = await find(StockTransfer, { issuer: issuerId });

    return {
        stakeholders: issuerStakeholders,
        stockClasses: issuerStockClasses,
        stockIssuances: issuerStockIssuances,
        stockTransfers: issuerStockTransfers,
    };
};

export const readAllIssuers = async () => {
    return await find(Issuer);
};

export const readfactories = async () => {
    return await find(Factory);
};
