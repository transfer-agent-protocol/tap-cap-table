import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

// Acceptance
// Used in EquityCompensationAcceptance, may be extended
const AcceptanceTransactionTypes = ["TX_PLAN_SECURITY_ACCEPTANCE", "TX_EQUITY_COMPENSATION_ACCEPTANCE"];

const EquityCompensationAcceptanceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, enum: AcceptanceTransactionTypes },
    comments: [String],
    security_id: String,
    date: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const EquityCompensationAcceptance = mongoose.model("EquityCompensationAcceptance", EquityCompensationAcceptanceSchema);

export default EquityCompensationAcceptance;
