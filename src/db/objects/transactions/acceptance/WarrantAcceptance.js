import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const WarrantAcceptanceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_WARRANT_ACCEPTANCE" },
    comments: [String],
    security_id: String,
    date: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const WarrantAcceptance = mongoose.model("WarrantAcceptance", WarrantAcceptanceSchema);

export default WarrantAcceptance;
