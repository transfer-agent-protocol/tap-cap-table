import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockTransferSchema = new mongoose.Schema(
    {
        _id: { type: String, default: () => uuid() },
        object_type: { type: String, default: "TX_STOCK_TRANSFER" }, // Updated object type
        quantity: String,
        comments: [String],
        security_id: String,
        date: String,
        consideration_text: String,
        balance_security_id: String,
        resulting_security_ids: [String],
        issuer: {
            type: String,
            ref: "Issuer",
        },
    },
    { timestamps: true }
);

const StockTransfer = mongoose.model("StockTransfer", StockTransferSchema);

export default StockTransfer;
