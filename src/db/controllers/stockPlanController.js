import stockPlanSchema from "../../../ocf/schema/objects/StockPlan.schema.json" assert { type: "json" };
import validateInput from "../../utils/validateInputAgainstSchema.js";

export const validateStockPlan = async (data) => {
    // First: validate the manifest against OCF, for the stockplan schema
    const { isValid, errors } = await validateInput(data, stockPlanSchema);

    if (isValid) {
        console.log("Schema is valid ", isValid);
    } else {
        throw new Error(JSON.stringify(errors, null, 2));
    }
};
