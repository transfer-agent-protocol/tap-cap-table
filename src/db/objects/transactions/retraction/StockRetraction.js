import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockRetractionSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_RETRACTION" },
    comments: [String],
    security_id: String,
    date: String,
    reason_text: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const StockRetraction = mongoose.model("StockRetraction", StockRetractionSchema);

export default StockRetraction;
