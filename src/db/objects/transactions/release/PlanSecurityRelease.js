import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const PlanSecurityReleaseSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_PLAN_SECURITY_RELEASE" },
    comments: [String],
    security_id: String,
    date: String,
    settlement_date: String,
    release_price: mongoose.Schema.Types.Mixed,
    quantity: String,
    consideration_text: String,
    resulting_security_ids: [String],
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const PlanSecurityRelease = mongoose.model("PlanSecurityRelease", PlanSecurityReleaseSchema);

export default PlanSecurityRelease;
