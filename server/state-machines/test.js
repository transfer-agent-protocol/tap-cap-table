import processSM from "./process.js";
import transactions from "../db/samples/data/Transactions.ocf.json" with { type: "json" };
import manifest from "../db/samples/data/Manifest.ocf.json" with { type: "json" };
import stockClasses from "../db/samples/data/StockClasses.ocf.json" with { type: "json" };

processSM(manifest.issuer, transactions, stockClasses);
