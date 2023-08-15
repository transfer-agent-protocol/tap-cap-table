import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const PlanSecurityRetractionSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_PLAN_SECURITY_RETRACTION" },
    comments: [String],
    security_id: String,
    date: String,
    reason_text: String,
});

const PlanSecurityRetraction = mongoose.model("PlanSecurityRetraction", PlanSecurityRetractionSchema);

export default PlanSecurityRetraction;