import { config } from "dotenv";
import getContractInstance from "./chain-operations/getContractInstances.js";
import startOnchainListeners from "./chain-operations/transactionListener.js";
import { readIssuerById } from "./db/operations/read.js";
import { contractCache } from "./utils/caches.js";
config();

const CHAIN = process.env.CHAIN;


export const chainMiddleware = (req, res, next) => {
    req.chain = CHAIN;
    next();
};

export const contractMiddleware = async (req, res, next) => {
    if (!req.body.issuerId) {
        console.log("❌ | No issuer ID");
        res.status(400).send("issuerId is required");
    }

    // fetch issuer to ensure it exists
    const issuer = await readIssuerById(req.body.issuerId);
    if (!issuer) res.status(400).send("issuer not found ");

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
