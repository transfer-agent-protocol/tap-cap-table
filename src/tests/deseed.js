import { connectDB } from "../db/config/mongoose.ts";
import HistoricalTransaction from "../db/objects/HistoricalTransaction.js";
import Issuer from "../db/objects/Issuer.js";
import Stakeholder from "../db/objects/Stakeholder.js";
import StockClass from "../db/objects/StockClass.js";
import StockLegendTemplate from "../db/objects/StockLegendTemplate.js";
import StockPlan from "../db/objects/StockPlan.js";
import Valuation from "../db/objects/Valuation.js";
import VestingTerms from "../db/objects/VestingTerms.js";
import { typeToModelType } from "../db/operations/transactions.js"; // Import the typeToModelType object to delete all transactions

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

export const deseedDatabase = async () => {
    const connection = await connectDB();
    console.log("Deseeding from database: ", connection.name);
    await deleteAll();
    console.log("✅ Database deseeded successfully");
    await connection.close();
};
