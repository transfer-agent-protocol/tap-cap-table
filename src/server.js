import { config } from "dotenv";
import express, { json, urlencoded } from "express";
config();

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

import { readIssuerById } from "./db/operations/read.js";
import { contractCache } from "./utils/caches.js";

const app = express();

// Connect to MongoDB
connectDB();

const PORT = 8080;
const CHAIN = process.env.CHAIN;

const API_KEY = process.env.API_KEY


// Middlewares
const chainMiddleware = (req, res, next) => {
    req.chain = CHAIN;
    next();
};

const authenticationMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).send('API key missing');
    }
    if (apiKey !== API_KEY) {
        return res.status(403).send('Invalid API key');
    }
    next();
};

// Middleware to get or create contract instance
// the listener is first started on deployment, then here as a backup
const contractMiddleware = async (req, res, next) => {
    if (!req.body.issuerId) {
        console.log("no issuer ID");
        res.status(400).send("issuerId required");
    }

    // fetch issuer to ensure it exists
    const issuer = await readIssuerById(req.body.issuerId);

    // Check if contract instance already exists in cache
    if (!contractCache[req.body.issuerId]) {
        const { contract, provider, libraries } = await getContractInstance(CHAIN, issuer.deployed_to);
        contractCache[req.body.issuerId] = { contract, provider, libraries };

        // Initialize listener for this contract
        startOnchainListeners(contract, provider, req.body.issuerId, libraries);
    }

    req.contract = contractCache[req.body.issuerId].contract;
    req.provider = contractCache[req.body.issuerId].provider;
    next();
};
app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(json({ limit: "50mb" }));
app.enable("trust proxy");

app.use("/", authenticationMiddleware, chainMiddleware, mainRoutes);
app.use("/issuer", authenticationMiddleware, chainMiddleware, issuerRoutes);
app.use("/stakeholder", authenticationMiddleware, contractMiddleware, stakeholderRoutes);
app.use("/stock-class", authenticationMiddleware, contractMiddleware, stockClassRoutes);
// No middleware required since these are only created offchain
app.use("/stock-legend", authenticationMiddleware, stockLegendRoutes);
app.use("/stock-plan", authenticationMiddleware, stockPlanRoutes);
app.use("/valuation", authenticationMiddleware, valuationRoutes);
app.use("/vesting-terms", authenticationMiddleware, vestingTermsRoutes);
app.use("/historical-transactions", authenticationMiddleware, historicalTransactions);

// transactions
app.use("/transactions/", authenticationMiddleware, contractMiddleware, transactionRoutes);

app.listen(PORT, async () => {
    console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
});
