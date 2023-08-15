import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const ConvertibleIssuanceSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_CONVERTIBLE_ISSUANCE" },
    investment_amount: {},
    convertible_type: String,
    conversion_triggers: [{}],
    pro_rata: String,
    seniority: Number,
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

const ConvertibleIssuance = mongoose.model("ConvertibleIssuance", ConvertibleIssuanceSchema);

export default ConvertibleIssuance;
