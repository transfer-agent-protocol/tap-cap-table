import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockAcceptanceSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_ACCEPTANCE" },
    comments: [String],
    security_id: String,
    date: String,
});

const StockAcceptance = mongoose.model("StockAcceptance", StockAcceptanceSchema);

export default StockAcceptance;
