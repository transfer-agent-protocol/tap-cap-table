import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockReissuanceSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_REISSUANCE" },
    comments: [String],
    security_id: String,
    date: String,
    resulting_security_ids: [String],
    split_transaction_id: String,
    reason_text: String,
});

const StockReissuance = mongoose.model("StockReissuance", StockReissuanceSchema);

export default StockReissuance;
