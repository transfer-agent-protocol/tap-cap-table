import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const ConvertibleTransferSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_CONVERTIBLE_TRANSFER" },
    amount: {},
    comments: [String],
    security_id: String,
    date: String,
    consideration_text: String,
    balance_security_id: String,
    resulting_security_ids: [String],
});

const ConvertibleTransfer = mongoose.model("ConvertibleTransfer", ConvertibleTransferSchema);

export default ConvertibleTransfer;
