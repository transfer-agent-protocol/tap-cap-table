import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const PlanSecurityIssuanceSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_PLAN_SECURITY_ISSUANCE" },
    stock_plan_id: String,
    stock_class_id: String,
    compensation_type: String,
    option_grant_type: String,
    quantity: String,
    exercise_price: {},
    base_price: {},
    early_exercisable: Boolean,
    vesting_terms_id: String,
    expiration_date: String,
    termination_exercise_windows: {},
    comments: [String],
    security_id: String,
    date: String,
    custom_id: String,
    stakeholder_id: String,
    board_approval_date: String,
    stockholder_approval_date: String,
    consideration_text: String,
    security_law_exemptions: [{}],
});

const PlanSecurityIssuance = mongoose.model("PlanSecurityIssuance", PlanSecurityIssuanceSchema);

export default PlanSecurityIssuance;
