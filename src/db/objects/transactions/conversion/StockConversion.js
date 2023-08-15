import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockConversionSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_CONVERSION" },
    balance_security_id: String,
    quantity_converted: String,
    comments: [String],
    security_id: String,
    date: String,
    resulting_security_ids: [String],
});

const StockConversion = mongoose.model("StockConversion", StockConversionSchema);

export default StockConversion;
