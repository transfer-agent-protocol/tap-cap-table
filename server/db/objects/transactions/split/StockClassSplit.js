import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockClassSplitSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_CLASS_SPLIT" },
    comments: [String],
    date: String,
    stock_class_id: String,
    split_ratio: {},
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const StockClassSplit = mongoose.model("StockClassSplit", StockClassSplitSchema);

export default StockClassSplit;
