import { createVestingTerms } from "../operations/create.js";

export const validateAndCreateVestingTerms = async (data) => {
    // First: validate the manifest against OCF, for the valuation schema
    // TODO

    // Second: create VestingTerms in DB
    const vestingTems = await createVestingTerms(data);

    console.log("Vesting terms created:", vestingTems);

    return vestingTems;
};
