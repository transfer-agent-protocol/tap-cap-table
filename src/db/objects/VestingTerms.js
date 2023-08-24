import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const VestingTermsSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "VESTING_TERMS" },
    name: String,
    description: String,
    allocation_type: String,
    vesting_conditions: {},
    comments: [String],
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const VestingTerms = mongoose.model("VestingTerms", VestingTermsSchema);

export default VestingTerms;
