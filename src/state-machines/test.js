import processSM from "./process.js";
import transactions from "../../src/db/samples/data/Transactions.ocf.json" assert { type: "json" };
import manifest from "../../src/db/samples/data/Manifest.ocf.json" assert { type: "json" };
import stockClasses from "../../src/db/samples/data/StockClasses.ocf.json" assert { type: "json" };

processSM(manifest.issuer, transactions, stockClasses);
