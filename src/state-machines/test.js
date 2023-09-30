import processSM from "./process.js";
import transactions from  "../../src/db/samples/notPoet/Transactions.ocf.json" assert {type: "json"}
const issuerId = "d3373e0a-4dd9-430f-8a56-3281f2800e1e"
processSM(issuerId, transactions)

