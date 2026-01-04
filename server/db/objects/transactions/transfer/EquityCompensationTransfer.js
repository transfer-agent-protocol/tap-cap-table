import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const EquityCompensationTransferType = ["TX_PLAN_SECURITY_TRANSFER", "TX_EQUITY_COMPENSATION_TRANSFER"];

const EquityCompensationTransferSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, enum: EquityCompensationTransferType },
    quantity: String,
    comments: [String],
    security_id: String,
    date: String,
    consideration_text: String,
    balance_security_id: String,
    resulting_security_ids: [String],
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const EquityCompensationTransfer = mongoose.model("EquityCompensationTransfer", EquityCompensationTransferSchema);

export default EquityCompensationTransfer;
