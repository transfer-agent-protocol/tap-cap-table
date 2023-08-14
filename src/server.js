import express, { json, urlencoded } from "express";
import connectDB from "./db/config/mongoose.js";
// import addNotPoetToDB from "./custom-offchain-scripts/seedNotPoet.js";
import startOnchainListeners from "./custom-chain-scripts/transactionListener.js";

import { config } from "dotenv";
config();

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// set up ethers listeners
const CHAIN = "local";
await startOnchainListeners(CHAIN);

// middlewares
app.use(urlencoded({ limit: "50mb", extended: true }));
app.use(json({ limit: "50mb" }));
app.enable("trust proxy");

app.get("/", async (req, res) => {
    res.send(`GM! The server is humming and ready.`);
});

app.listen(PORT, () => {
    console.log(`🚀  Server successfully launched. Access at: http://localhost:${PORT}`);
});
