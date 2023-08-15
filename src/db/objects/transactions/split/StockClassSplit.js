import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockClassSplitSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_CLASS_SPLIT" },
    comments: [String],
    date: String,
    stock_class_id: String,
    split_ratio: {},
});

const StockClassSplit = mongoose.model("StockClassSplit", StockClassSplitSchema);

export default StockClassSplit;