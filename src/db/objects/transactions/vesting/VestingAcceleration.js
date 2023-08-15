import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const VestingAccelerationSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_VESTING_ACCELERATION" },
    quantity: String,
    reason_text: String,
    comments: [String],
    date: String,
    security_id: String,
});

const VestingAcceleration = mongoose.model("VestingAcceleration", VestingAccelerationSchema);

export default VestingAcceleration;
