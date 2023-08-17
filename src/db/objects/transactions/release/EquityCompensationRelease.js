import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const EquityCompensationReleaseType = ["TX_PLAN_SECURITY_RELEASE", "TX_EQUITY_COMPENSATION_RELEASE"];

const EquityCompensationReleaseSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, enum: EquityCompensationReleaseType },
    comments: [String],
    security_id: String,
    date: String,
    settlement_date: String,
    release_price: mongoose.Schema.Types.Mixed,
    quantity: String,
    consideration_text: String,
    resulting_security_ids: [String],
});

const EquityCompensationRelease = mongoose.model("EquityCompensationRelease", EquityCompensationReleaseSchema);

export default EquityCompensationRelease;
