import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const VestingStartSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_VESTING_START" },
    vesting_condition_id: String,
    comments: [String],
    date: String,
    security_id: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const VestingStart = mongoose.model("VestingStart", VestingStartSchema);

export default VestingStart;
