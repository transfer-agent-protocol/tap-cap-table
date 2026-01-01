import processSM from "./process.js";
import transactions from "../../src/db/samples/data/Transactions.ocf.json" with { type: "json" };
import manifest from "../../src/db/samples/data/Manifest.ocf.json" with { type: "json" };
import stockClasses from "../../src/db/samples/data/StockClasses.ocf.json" with { type: "json" };

processSM(manifest.issuer, transactions, stockClasses);
