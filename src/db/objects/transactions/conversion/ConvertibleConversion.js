import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const ConvertibleConversionSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_CONVERTIBLE_CONVERSION" },
    reason_text: String,
    quantity_converted: String,
    balance_security_id: String,
    trigger_id: String,
    capitalization_definition: {},
    comments: [String],
    security_id: String,
    date: String,
    resulting_security_ids: [String],
});

const ConvertibleConversion = mongoose.model("ConvertibleConversion", ConvertibleConversionSchema);

export default ConvertibleConversion;
