import { createStockLegendTemplate } from "../operations/create.js";

export const validateAndCreateStockLegend = async (data) => {
    // First: validate the manifest against OCF, for the stocklegend schema
    // TODO

    // Second: create StockLegend in DB
    const stockLegend = await createStockLegendTemplate(data);

    console.log("StockLegend created:", stockLegend);

    return stockLegend;
};
