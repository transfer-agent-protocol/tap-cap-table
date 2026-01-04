import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const WarrantIssuanceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_WARRANT_ISSUANCE" },
    quantity: String,
    exercise_price: {},
    purchase_price: {},
    exercise_triggers: [{}],
    warrant_expiration_date: String,
    vesting_terms_id: String,
    quantity_source: String,
    comments: [String],
    security_id: String,
    date: String,
    custom_id: String,
    stakeholder_id: String,
    board_approval_date: String,
    stockholder_approval_date: String,
    consideration_text: String,
    security_law_exemptions: [{}],
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const WarrantIssuance = mongoose.model("WarrantIssuance", WarrantIssuanceSchema);

export default WarrantIssuance;
