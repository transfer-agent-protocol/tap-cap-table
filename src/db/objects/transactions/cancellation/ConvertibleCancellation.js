import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const ConvertibleCancellationSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_CONVERTIBLE_CANCELLATION" },
    amount: {},
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

const ConvertibleCancellation = mongoose.model("ConvertibleCancellation", ConvertibleCancellationSchema);

export default ConvertibleCancellation;
