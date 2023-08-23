import { createStockLegendTemplate } from "../operations/create.js";
import validateInput from "../../utils/validateInputAgainstSchema.js";
import stockLegendSchema from "../../../ocf/schema/objects/StockLegendTemplate.schema.json" assert { type: "json" };

export const validateAndCreateStockLegend = async (data) => {
    // First: validate the manifest against OCF, for the stocklegend schema
    const { isValid, errors } = await validateInput(data, stockLegendSchema);

    if (isValid) {
        console.log("Validated Stock Legend 🚀");
        // Second: create StockLegend in DB
        const stockLegend = await createStockLegendTemplate(data);

        console.log("StockLegend created:", stockLegend);

        return stockLegend;
    } else {
        throw new Error(JSON.stringify(errors, null, 2));
    }
};
