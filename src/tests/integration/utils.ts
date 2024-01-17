import { shutdownServer, startServer } from "../../app";
import { connectDB } from "../../db/config/mongoose";
import HistoricalTransaction from "../../db/objects/HistoricalTransaction";
import Issuer from "../../db/objects/Issuer";
import Stakeholder from "../../db/objects/Stakeholder";
import StockClass from "../../db/objects/StockClass";
import StockLegendTemplate from "../../db/objects/StockLegendTemplate";
import StockPlan from "../../db/objects/StockPlan";
import Valuation from "../../db/objects/Valuation";
import VestingTerms from "../../db/objects/VestingTerms";
import { typeToModelType } from "../../db/operations/transactions"; // Import the typeToModelType object to delete all transactions

export const SERVER_BASE = `http://localhost:${process.env.PORT}`;

let _server = null;

export const runLocalServer = async (deseed) => {
    if (deseed) {
        await deseedDatabase();
    }
    console.log("starting server");
    _server = await startServer(false);
}


export const shutdownLocalServer = async () => {
    console.log("shutting down server");
    await shutdownServer(_server);
}


const deleteAllTransactions = async () => {
    for (const ModelType of Object.values(typeToModelType)) {
        // @ts-ignore
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
