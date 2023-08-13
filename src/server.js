import express, { json, urlencoded } from "express";
import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import startOnchainListeners from "./custom-chain-scripts/transactionListener.js";
import getContractInstance from "./custom-chain-scripts/getContractInstances.js";

// Routes
import mainRoutes from "./routes/index.js";
import issuerRoutes from "./routes/issuer.js";
import stakeholderRoutes from "./routes/stakeholder.js";
import stockClassRoutes from "./routes/stockClass.js";

const app = express();

const PORT = 3000;
const CHAIN = "local"; // change this to prod or env style variable

// Middlewares
const contractMiddleware = async (req, res, next) => {
    req.contract = await getContractInstance(CHAIN);
    next();
};

app.use((req, res, next) => {
    req.prisma = prisma;
    req.chain = CHAIN;
    next();
});

app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(json({ limit: "50mb" }));
app.enable("trust proxy");

app.use("/", mainRoutes);
app.use("/issuer", contractMiddleware, issuerRoutes);
app.use("/stakeholder", contractMiddleware, stakeholderRoutes);
app.use("/stock-class", contractMiddleware, stockClassRoutes);

app.listen(PORT, async () => {
    console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
    await startOnchainListeners(CHAIN, prisma);
});
