import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const PlanSecurityCancellationSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_PLAN_SECURITY_CANCELLATION" },
    comments: [String],
    security_id: String,
    date: String,
    quantity: String,
    balance_security_id: String,
    reason_text: String,
});

const PlanSecurityCancellation = mongoose.model("PlanSecurityCancellation", PlanSecurityCancellationSchema);

export default PlanSecurityCancellation;
