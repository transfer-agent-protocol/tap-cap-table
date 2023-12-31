import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const ConvertibleAcceptanceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_CONVERTIBLE_ACCEPTANCE" },
    comments: [String],
    security_id: String,
    date: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const ConvertibleAcceptance = mongoose.model("ConvertibleAcceptance", ConvertibleAcceptanceSchema);

export default ConvertibleAcceptance;
