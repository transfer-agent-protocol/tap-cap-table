import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const IssuerAuthorizedSharesAdjustmentSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT" },
    comments: [String],
    date: String,
    issuer_id: String,
    new_shares_authorized: String,
    board_approval_date: String,
    stockholder_approval_date: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const IssuerAuthorizedSharesAdjustment = mongoose.model("IssuerAuthorizedSharesAdjustment", IssuerAuthorizedSharesAdjustmentSchema);

export default IssuerAuthorizedSharesAdjustment;
