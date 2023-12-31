import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockLegendTemplateSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "STOCK_LEGEND_TEMPLATE" },
    name: String,
    text: String,
    comments: [String],
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const StockLegendTemplate = mongoose.model("StockLegendTemplate", StockLegendTemplateSchema);

export default StockLegendTemplate;
