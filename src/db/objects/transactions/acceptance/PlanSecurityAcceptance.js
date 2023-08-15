import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const PlanSecurityAcceptanceSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_PLAN_SECURITY_ACCEPTANCE" },
    comments: [String],
    security_id: String,
    date: String,
});

const PlanSecurityAcceptance = mongoose.model("PlanSecurityAcceptance", PlanSecurityAcceptanceSchema);

export default PlanSecurityAcceptance;