import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockTransfer from "../objects/transactions/transfer/StockTransfer.js";
import StockIssuance from "../objects/transactions/issuance/StockIssuance.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import StockCancellation from "../objects/transactions/cancellation/StockCancellation.js";
import StockRetraction from "../objects/transactions/retraction/StockRetraction.js";
import StockReissuance from "../objects/transactions/reissuance/StockReissuance.js";
import StockRepurchase from "../objects/transactions/repurchase/StockRepurchase.js";

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

export const upsertStockIssuanceById = async (id, updatedData) => {
    const stockIssuance = await StockIssuance.findByIdAndUpdate(id, updatedData, { new: true, upsert: true, returning: true });
    return stockIssuance;
};

export const upsertStockTransferById = async (id, updatedData) => {
    const stockTransfer = await StockTransfer.findByIdAndUpdate(id, updatedData, { new: true, upsert: true, returning: true });
    return stockTransfer;
};

export const upsertStockCancellationById = async (id, updatedData) => {
    const stockCancellation = await StockCancellation.findByIdAndUpdate(id, updatedData, { new: true, upsert: true, returning: true });
    return stockCancellation;
};

export const upsertStockRetractionById = async (id, updatedData) => {
    const stockRetraction = await StockRetraction.findByIdAndUpdate(id, updatedData, { new: true, upsert: true, returning: true });
    return stockRetraction;
};

export const upsertStockReissuanceById = async (id, updatedData) => {
    const stockReissuance = await StockReissuance.findByIdAndUpdate(id, updatedData, { new: true, upsert: true, returning: true });
    return stockReissuance;
};

export const upsertStockRepurchaseById = async (id, updatedData) => {
    const stockRepurchase = await StockRepurchase.findByIdAndUpdate(id, updatedData, { new: true, upsert: true, returning: true });
    return stockRepurchase;
};
