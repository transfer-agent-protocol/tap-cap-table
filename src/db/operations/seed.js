import readAndParseJSON from "../../utils/readAndParseJson.js";
import { createIssuer, createStockLegendTemplate, createStockClass, createStockIssuance, createStakeholder, createVestingTerms } from "./create.js";
import inputManifest from "../samples/notPoet/Manifest.ocf.json" assert { type: "json" };

async function addNotPoetToDB() {
    const inputIssuer = inputManifest.issuer;
    const issuer = await createIssuer(inputIssuer);
    console.log("Issuer added ", issuer);

    // STOCK LEGENDS
    const inputStockLegends = await readAndParseJSON(inputManifest.stock_legend_templates_files[0].filepath, "notPoet");
    console.log("Adding Stock Legends to DB");
    for (const inputStockLegend of inputStockLegends.items) {
        const stockLegend = await createStockLegendTemplate(inputStockLegend); // Updated to match the correct function name
        console.log("Stock legend added ", stockLegend);
    }

    // STOCK CLASS
    const inputStockClasses = await readAndParseJSON(inputManifest.stock_classes_files[0].filepath, "notPoet");
    console.log("Adding Stock Classes to DB");
    for (const inputStockClass of inputStockClasses.items) {
        const stockClass = await createStockClass(inputStockClass);
        console.log("Stock classes added ", stockClass);
    }

    // TRANSACTIONS
    const inputTransactions = await readAndParseJSON(inputManifest.transactions_files[0].filepath, "notPoet");

    console.log("Adding Transactions to DB");
    for (const inputTransaction of inputTransactions.items) {
        // Note the change here
        const transaction = await createStockIssuance(inputTransaction); // Create a DB entry for each transaction
        console.log("Transaction added ", transaction);
    }

    // STAKEHOLDERS
    const inputStakeholders = await readAndParseJSON(inputManifest.stakeholders_files[0].filepath, "notPoet");
    console.log("Adding Stakeholders to DB");
    for (const inputStakeholder of inputStakeholders.items) {
        const stakeholder = await createStakeholder(inputStakeholder);
        console.log("Stakeholder added ", stakeholder);
    }

    // VESTING TERMS
    const inputVestingTerms = await readAndParseJSON(inputManifest.vesting_terms_files[0].filepath, "notPoet");
    console.log("Adding Vesting Terms to DB");
    for (const inputVestingTerm of inputVestingTerms.items) {
        const vestingTerm = await createVestingTerms(inputVestingTerm);
        console.log("Vesting term added ", vestingTerm);
    }
}

export default addNotPoetToDB;
