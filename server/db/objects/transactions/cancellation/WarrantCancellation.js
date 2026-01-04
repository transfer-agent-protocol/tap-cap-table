import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const WarrantCancellationSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_WARRANT_CANCELLATION" },
    quantity: String,
    comments: [String],
    security_id: String,
    date: String,
    balance_security_id: String,
    reason_text: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const WarrantCancellation = mongoose.model("WarrantCancellation", WarrantCancellationSchema);

export default WarrantCancellation;
