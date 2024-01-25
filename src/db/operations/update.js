import sleep from "../../utils/sleep.js";
import Factory from "../objects/Factory.js";
import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import StockAcceptance from "../objects/transactions/acceptance/StockAcceptance.js";
import IssuerAuthorizedSharesAdjustment from "../objects/transactions/adjustment/IssuerAuthorizedSharesAdjustment.js";
import StockClassAuthorizedSharesAdjustment from "../objects/transactions/adjustment/StockClassAuthorizedSharesAdjustment.js";
import StockCancellation from "../objects/transactions/cancellation/StockCancellation.js";
import StockIssuance from "../objects/transactions/issuance/StockIssuance.js";
import StockReissuance from "../objects/transactions/reissuance/StockReissuance.js";
import StockRepurchase from "../objects/transactions/repurchase/StockRepurchase.js";
import StockRetraction from "../objects/transactions/retraction/StockRetraction.js";
import StockTransfer from "../objects/transactions/transfer/StockTransfer.js";
import { findByIdAndUpdate, findOne } from "./atomic.ts";
import { createFactory } from "./create.js";


export const web3WaitTime = 5000;


const retryOnMiss = async (updateFunc, numRetries = 5, waitBase = null) => {
    /* kkolze: When polling `latest` instead of `finalized` web3 blocks, web3 can get ahead of mongo 
      For example, see the `issuer.post("/create"` code: the issuer is created in mongo after deployCapTable is called  
      We add retries to ensure the server routes have written to mongo  */
    let tried = 0;
    const waitMultiplier = waitBase || web3WaitTime;
    while (tried <= numRetries) {
        const res = await updateFunc();
        if (res !== null) {
            return res;
        }
        tried++;
        await sleep(tried * waitMultiplier, "Returned null, retrying in ");
    }
}


export const updateIssuerById = async (id, updatedData) => {
    return await findByIdAndUpdate(Issuer, id, updatedData, { new: true });
};

export const updateStakeholderById = async (id, updatedData) => {
    return await retryOnMiss(async () => findByIdAndUpdate(Stakeholder, id, updatedData, { new: true }));
};

export const updateStockClassById = async (id, updatedData) => {
    return await retryOnMiss(async () => findByIdAndUpdate(StockClass, id, updatedData, { new: true }));
};

export const updateStockLegendTemplateById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockLegendTemplate, id, updatedData, { new: true });
};

export const updateStockPlanById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockPlan, id, updatedData, { new: true });
};

export const updateValuationById = async (id, updatedData) => {
    return await findByIdAndUpdate(Valuation, id, updatedData, { new: true });
};

export const updateVestingTermsById = async (id, updatedData) => {
    return await findByIdAndUpdate(VestingTerms, id, updatedData, { new: true });
};

export const upsertStockIssuanceById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockIssuance, id, updatedData, { new: true, upsert: true });
};

export const upsertStockTransferById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockTransfer, id, updatedData, { new: true, upsert: true });
};

export const upsertStockCancellationById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockCancellation, id, updatedData, { new: true, upsert: true });
};

export const upsertStockRetractionById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockRetraction, id, updatedData, { new: true, upsert: true });
};

export const upsertStockReissuanceById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockReissuance, id, updatedData, { new: true, upsert: true });
};

export const upsertStockRepurchaseById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockRepurchase, id, updatedData, { new: true, upsert: true });
};

export const upsertStockAcceptanceById = async (id, updatedData) => {
    return await findByIdAndUpdate(StockAcceptance, id, updatedData, { new: true, upsert: true });
};

export const upsertStockClassAuthorizedSharesAdjustment = async (id, updatedData) => {
    return await findByIdAndUpdate(StockClassAuthorizedSharesAdjustment, id, updatedData, { new: true, upsert: true });
};

export const upsertIssuerAuthorizedSharesAdjustment = async (id, updatedData) => {
    return await findByIdAndUpdate(IssuerAuthorizedSharesAdjustment, id, updatedData, { new: true, upsert: true });
};

export const upsertFactory = async (updatedData) => {
    // For now, we only allow a single record in the database
    const existing = await findOne(Factory);
    if (existing) {
        return await findByIdAndUpdate(Factory, existing._id, updatedData, { new: true });
    } 
    return await createFactory(updatedData);
}
