import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockLegendTemplateSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "STOCK_LEGEND_TEMPLATE" },
    name: String,
    text: String,
    comments: [String],
});

const StockLegendTemplate = mongoose.model("StockLegendTemplate", StockLegendTemplateSchema);

export default StockLegendTemplate;
