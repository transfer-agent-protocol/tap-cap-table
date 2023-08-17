import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

// subset of Stock Class
const StockPlanSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "STOCK_PLAN" },
    plan_name: String,
    board_approval_date: String,
    stockholder_approval_date: String,
    initial_shares_reserved: String,
    default_cancellation_behavior: String,
    stock_class_id: String,
    comments: [String],
});

const StockPlan = mongoose.model("StockPlan", StockPlanSchema);

export default StockPlan;
