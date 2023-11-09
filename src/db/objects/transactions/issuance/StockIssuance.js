import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockIssuanceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_ISSUANCE" },
    stock_class_id: String,
    stock_plan_id: String,
    share_numbers_issued: [{}],
    share_price: {},
    quantity: String,
    vesting_terms_id: String,
    cost_basis: {},
    stock_legend_ids: [String],
    issuance_type: String,
    comments: [String],
    security_id: String,
    date: String,
    custom_id: String,
    stakeholder_id: String,
    board_approval_date: String,
    stockholder_approval_date: String,
    consideration_text: String,
    security_law_exemptions: [{}],
    issuer: {
        type: String,
        ref: "Issuer",
    },
    is_onchain_synced: { type: Boolean, default: false },
}, {timestamps: true});

const StockIssuance = mongoose.model("StockIssuance", StockIssuanceSchema);

export default StockIssuance;
