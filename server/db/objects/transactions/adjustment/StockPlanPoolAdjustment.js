import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockPlanPoolAdjustmentSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_PLAN_POOL_ADJUSTMENT" },
    comments: [String],
    date: String,
    stock_plan_id: String,
    board_approval_date: String,
    stockholder_approval_date: String,
    shares_reserved: String,
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const StockPlanPoolAdjustment = mongoose.model("StockPlanPoolAdjustment", StockPlanPoolAdjustmentSchema);

export default StockPlanPoolAdjustment;
