import { config } from "dotenv";
import express, { json, urlencoded } from "express";
config();
import {contractMiddleware, chainMiddleware} from './middlewares.js';
import connectDB from "./db/config/mongoose.js";

import getContractInstance from "./chain-operations/getContractInstances.js";
import startOnchainListeners from "./chain-operations/transactionListener.js";

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
import demo from "./routes/demo.js";

import { readIssuerById } from "./db/operations/read.js";
import { contractCache } from "./utils/caches.js";

const app = express();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT;
const CHAIN = process.env.CHAIN;

// Middlewares

// Middleware to get or create contract instance
// the listener is first started on deployment, then here as a backup
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
app.use("/demo",  demo);

// transactions
app.use("/transactions/", contractMiddleware, transactionRoutes);

app.listen(PORT, async () => {
    console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
});
