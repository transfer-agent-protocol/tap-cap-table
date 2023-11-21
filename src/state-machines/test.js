import processSM from "./process.js";
import transactions from "../../src/db/samples/notPoet/Transactions.ocf.json" assert { type: "json" };
import manifest from "../../src/db/samples/notPoet/Manifest.ocf.json" assert { type: "json" };
import stockClasses from "../../src/db/samples/notPoet/StockClasses.ocf.json" assert { type: "json" };

processSM(manifest.issuer, transactions, stockClasses);
