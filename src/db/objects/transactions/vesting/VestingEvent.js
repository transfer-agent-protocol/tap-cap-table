import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const VestingEventSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_VESTING_EVENT" },
    vesting_condition_id: String,
    comments: [String],
    date: String,
    security_id: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const VestingEvent = mongoose.model("VestingEvent", VestingEventSchema);

export default VestingEvent;
