import express, { json, urlencoded } from "express";
import { config } from "dotenv";
config();

import connectDB from "./db/config/mongoose.js";

import startOnchainListeners from "./chain-operations/transactionListener.js";
import getContractInstance from "./chain-operations/getContractInstances.js";

// Routes
import mainRoutes from "./routes/index.js";
import stakeholderRoutes from "./routes/stakeholder.js";
import stockClassRoutes from "./routes/stockClass.js";
import transactionRoutes from "./routes/transactions.js";

const app = express();

// Connect to MongoDB
connectDB();

const PORT = 3000;
const CHAIN = "local"; // TODO change this to prod or env style variable

// Middlewares
const chainMiddleware = (req, res, next) => {
    req.chain = CHAIN;
    next();
};

const contractMiddleware = async (req, res, next) => {
    const { contract, provider } = await getContractInstance(CHAIN);
    req.contract = contract;
    req.provider = provider;
    next();
};

app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(json({ limit: "50mb" }));
app.enable("trust proxy");

app.use("/", chainMiddleware, mainRoutes);
app.use("/stakeholder", contractMiddleware, stakeholderRoutes);
app.use("/stock-class", contractMiddleware, stockClassRoutes);

// transactions
app.use("/transactions/", contractMiddleware, transactionRoutes);

app.listen(PORT, async () => {
    console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
    await startOnchainListeners(CHAIN);
});
