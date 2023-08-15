import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const ValuationsSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "VALUATION" },
    provider: String,
    board_approval_date: String,
    price_per_share: {},
    effective_date: String,
    stock_class_id: String,
    valuation_type: String,
    comments: [String],
});

const Valuations = mongoose.model("Valuations", ValuationsSchema);

export default Valuations;
