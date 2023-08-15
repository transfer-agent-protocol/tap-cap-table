import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const CancellationTransactionTypes = ["TX_PLAN_SECURITY_CANCELLATION", "TX_EQUITY_COMPENSATION_CANCELLATION"];

const EquityCompensationCancellationSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, enum: CancellationTransactionTypes },
    quantity: String,
    comments: [String],
    security_id: String,
    date: String,
    balance_security_id: String,
    reason_text: String,
});

const EquityCompensationCancellation = mongoose.model("EquityCompensationCancellation", EquityCompensationCancellationSchema);

export default EquityCompensationCancellation;
