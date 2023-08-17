import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const WarrantTransferSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_WARRANT_TRANSFER" },
    quantity: String,
    comments: [String],
    security_id: String,
    date: String,
    consideration_text: String,
    balance_security_id: String,
    resulting_security_ids: [String],
});

const WarrantTransfer = mongoose.model("WarrantTransfer", WarrantTransferSchema);

export default WarrantTransfer;
