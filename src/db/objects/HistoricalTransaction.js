import mongoose from "mongoose";

const HistoricalTransactionSchema = new mongoose.Schema({
    transaction: {
        type: String,
        refPath: "transactionType", // This will use the value of transactionType as the model name for population
    },
    transactionType: {
        type: String,
        enum: ["StockIssuance", "StockTransfer", "StockCancellation", "StockRetraction"], // List of possible models
        required: true,
    },
    issuer: {
        type: String,
        ref: "Issuer",
    },
});

const HistoricalTransaction = mongoose.model("HistoricalTransaction", HistoricalTransactionSchema);

export default HistoricalTransaction;
