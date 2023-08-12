import express, { json, urlencoded } from "express";
import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import startOnchainListeners from "./custom-chain-scripts/transactionListener.js";

// Routes
import mainRoutes from "./routes/main.js";
import issuerRoutes from "./routes/issuer.js";
import stakeholderRoutes from "./routes/stakeholder.js";
import stockClassRoutes from "./routes/stockClass.js";

const app = express();

const PORT = 3000;
const CHAIN = "local"; // change this to prod or env style variable

// middlewares
app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(json({ limit: "50mb" }));
app.enable("trust proxy");
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});
app.use("/", mainRoutes);
app.use("/issuer", issuerRoutes);
app.use("/stakeholder", stakeholderRoutes);
app.use("/stock-class", stockClassRoutes);

app.listen(PORT, async () => {
    console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
    await startOnchainListeners(CHAIN, prisma);
});
