import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const HistoricalTransactionSchema = new mongoose.Schema({
    transaction_id: { type: String },
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const HistoricalTransaction = mongoose.model("HistoricalTransaction", HistoricalTransactionSchema);

export default HistoricalTransaction;
