import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockAcceptanceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_ACCEPTANCE" },
    comments: [String],
    security_id: String,
    date: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const StockAcceptance = mongoose.model("StockAcceptance", StockAcceptanceSchema);

export default StockAcceptance;
