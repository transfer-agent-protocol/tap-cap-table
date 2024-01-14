import mongoose from "mongoose";
import { connectDB } from "../config/mongoose.ts";
import HistoricalTransaction from "../objects/HistoricalTransaction.js";
import Issuer from "../objects/Issuer.js";
import Stakeholder from "../objects/Stakeholder.js";
import StockClass from "../objects/StockClass.js";
import StockLegendTemplate from "../objects/StockLegendTemplate.js";
import StockPlan from "../objects/StockPlan.js";
import Valuation from "../objects/Valuation.js";
import VestingTerms from "../objects/VestingTerms.js";
import { typeToModelType } from "../operations/transactions.js"; // Import the typeToModelType object to delete all transactions

const deleteAllTransactions = async () => {
    for (const ModelType of Object.values(typeToModelType)) {
        await ModelType.deleteMany({});
    }
};

const deleteAll = async () => {
    // Delete all documents from the collections
    await Issuer.deleteMany({});
    await Stakeholder.deleteMany({});
    await StockClass.deleteMany({});
    await StockLegendTemplate.deleteMany({});
    await StockPlan.deleteMany({});
    await Valuation.deleteMany({});
    await VestingTerms.deleteMany({});
    await HistoricalTransaction.deleteMany({});
    await deleteAllTransactions(); // Delete all transactions
};

const deseedDatabase = async () => {
    try {
        connectDB();

        await deleteAll();

        console.log("✅ Database deseeded successfully");

        // Close the database connection
        await mongoose.connection.close();
    } catch (err) {
        console.log("❌ Error deseeding database:", err);
    }
};

deseedDatabase();
