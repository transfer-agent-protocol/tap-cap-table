import { config } from "dotenv";
import express, { json, urlencoded } from "express";
config();

import { connectDB } from "./db/config/mongoose.ts";

import { startEventProcessing, stopEventProcessing } from "./chain-operations/transactionPoller.ts";

// Routes
import historicalTransactions from "./routes/historicalTransactions.js";
import mainRoutes from "./routes/index.js";
import issuerRoutes from "./routes/issuer.js";
import stakeholderRoutes from "./routes/stakeholder.js";
import stockClassRoutes from "./routes/stockClass.js";
import stockLegendRoutes from "./routes/stockLegend.js";
import stockPlanRoutes from "./routes/stockPlan.js";
import transactionRoutes from "./routes/transactions.js";
import valuationRoutes from "./routes/valuation.js";
import vestingTermsRoutes from "./routes/vestingTerms.js";

import mongoose from "mongoose";
import { readIssuerById } from "./db/operations/read.js";
import { getIssuerContract } from "./utils/caches.ts";

const app = express();

const PORT = process.env.PORT;
const CHAIN = process.env.CHAIN;

// Middlewares
const chainMiddleware = (req, res, next) => {
    req.chain = CHAIN;
    next();
};

// Middleware to get or create contract instance
// the listener is first started on deployment, then here as a backup
const contractMiddleware = async (req, res, next) => {
    if (!req.body.issuerId) {
        console.log("❌ | No issuer ID");
        res.status(400).send("issuerId is required");
    }

    // fetch issuer to ensure it exists
    const issuer = await readIssuerById(req.body.issuerId);
    if (!issuer) res.status(400).send("issuer not found ");

    const {contract, provider} = await getIssuerContract(issuer);
    req.contract = contract;
    req.provider = provider;
    next();
};
app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(json({ limit: "50mb" }));
app.enable("trust proxy");

app.use("/", chainMiddleware, mainRoutes);
app.use("/issuer", chainMiddleware, issuerRoutes);
app.use("/stakeholder", contractMiddleware, stakeholderRoutes);
app.use("/stock-class", contractMiddleware, stockClassRoutes);
// No middleware required since these are only created offchain
app.use("/stock-legend", stockLegendRoutes);
app.use("/stock-plan", stockPlanRoutes);
app.use("/valuation", valuationRoutes);
app.use("/vesting-terms", vestingTermsRoutes);
app.use("/historical-transactions", historicalTransactions);

// transactions
app.use("/transactions/", contractMiddleware, transactionRoutes);

export const startServer = async () => {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, async () => {
        console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
        // Asynchronous job to track web3 events in web2
        startEventProcessing();
    });

    return server;
};

export const shutdownServer = async (server) => {
    console.log("Shutting down app server...");
    server.close();
    console.log("Stopping event processing...");
    stopEventProcessing();
    console.log("Disconnecting from mongo...");
    await mongoose.disconnect();
    console.log(" done!");
}

