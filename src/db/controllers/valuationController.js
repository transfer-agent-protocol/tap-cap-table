import { createValuation } from "../operations/create.js";

export const validateAndCreateValuation = async (data) => {
    // First: validate the manifest against OCF, for the valuation schema
    // TODO

    // Second: create Valuation in DB
    const valuation = await createValuation(data);

    console.log("Valuation created:", valuation);

    return valuation;
};
