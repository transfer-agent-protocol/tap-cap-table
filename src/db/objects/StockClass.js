import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

// This model is verified with optional and required fields, comments must remain to aid onchain to offchain translation.
const StockClassSchema = new mongoose.Schema(
    {
        _id: { type: String, default: () => uuid() },
        object_type: { type: String, default: "STOCK_CLASS" },
        name: String,
        class_type: String,
        default_id_prefix: String,
        initial_shares_authorized: String,
        board_approval_date: String,
        votes_per_share: String,
        par_value: {},
        price_per_share: {},
        seniority: String,
        conversion_rights: {},
        liquidation_preference_multiple: String,
        participation_cap_multiple: String,
        comments: [String],
        issuer: {
            type: String,
            ref: "Issuer",
        },
        is_onchain_synced: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Stockclass = mongoose.model("StockClass", StockClassSchema);

export default Stockclass;
