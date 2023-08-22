import { createStockPlan } from "../operations/create.js";

export const validateAndCreateStockPlan = async (data) => {
    // First: validate the manifest against OCF, for the stockplan schema
    // TODO

    // Second: create StockPlan in DB
    const stockPlan = await createStockPlan(data);

    console.log("StockPlan created:", stockPlan);

    return stockPlan;
};
