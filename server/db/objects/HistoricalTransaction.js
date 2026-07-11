import mongoose from "mongoose";

const HistoricalTransactionSchema = new mongoose.Schema(
    {
        transaction: {
            type: String,
            refPath: "transactionType", // This will use the value of transactionType as the model name for population
        },
        transactionType: {
            type: String,
            enum: [
                "StockIssuance",
                "StockTransfer",
                "StockCancellation",
                "StockRetraction",
                "StockReissuance",
                "StockRepurchase",
                "StockAcceptance",
                "IssuerAuthorizedSharesAdjustment",
                "StockClassAuthorizedSharesAdjustment",
            ], // List of possible models
            required: true,
        },
        issuer: {
            type: String,
            ref: "Issuer",
        },
        // Ethereum tx hash of the TxCreated (or related) log — for Activity / explorer links
        tx_hash: { type: String, default: null },
    },
    { timestamps: true }
);

const HistoricalTransaction = mongoose.model("HistoricalTransaction", HistoricalTransactionSchema);

export default HistoricalTransaction;
