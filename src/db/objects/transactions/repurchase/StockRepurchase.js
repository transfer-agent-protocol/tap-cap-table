import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockRepurchaseSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_REPURCHASE" },
    comments: [String],
    security_id: String,
    date: String,
    price: { type: Map, of: String }, // or Json
    quantity: String,
    consideration_text: String,
    balance_security_id: String,
});

const StockRepurchase = mongoose.model("StockRepurchase", StockRepurchaseSchema);

export default StockRepurchase;
