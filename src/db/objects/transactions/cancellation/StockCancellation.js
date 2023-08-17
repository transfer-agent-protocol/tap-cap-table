import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockCancellationSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_CANCELLATION" },
    quantity: String,
    comments: [String],
    security_id: String,
    date: String,
    balance_security_id: String,
    reason_text: String,
});

const StockCancellation = mongoose.model("StockCancellation", StockCancellationSchema);

export default StockCancellation;
