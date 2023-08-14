import connectDB from "../config/mongoose.js";
import readAndParseJSON from "../../utils/readAndParseJson.js";
import {
    createIssuer,
    createStakeholder,
    createStockClass,
    createStockLegendTemplate,
    createStockPlan,
    createValuation,
    createVestingTerms,
    Transactions,
} from "../operations/create.js";
import inputManifest from "../samples/notPoet/Manifest.ocf.json" assert { type: "json" };

connectDB();

async function addNotPoetToDB() {
    const inputIssuer = inputManifest.issuer;
    const issuer = await createIssuer(inputIssuer);
    console.log("Issuer added ", issuer);

    // STAKEHOLDERS
    const inputStakeholders = await readAndParseJSON(inputManifest.stakeholders_files[0].filepath, "notPoet");
    console.log("Adding Stakeholders to DB");
    for (const inputStakeholder of inputStakeholders.items) {
        const stakeholder = await createStakeholder(inputStakeholder);
        console.log("Stakeholder added ", stakeholder);
    }

    // STOCK CLASS
    const inputStockClasses = await readAndParseJSON(inputManifest.stock_classes_files[0].filepath, "notPoet");
    console.log("Adding Stock Classes to DB");
    for (const inputStockClass of inputStockClasses.items) {
        const stockClass = await createStockClass(inputStockClass);
        console.log("Stock classes added ", stockClass);
    }

    // STOCK LEGENDS
    const inputStockLegends = await readAndParseJSON(inputManifest.stock_legend_templates_files[0].filepath, "notPoet");
    console.log("Adding Stock Legends to DB");
    for (const inputStockLegend of inputStockLegends.items) {
        const stockLegend = await createStockLegendTemplate(inputStockLegend); // Updated to match the correct function name
        console.log("Stock legend added ", stockLegend);
    }

    // STOCK PLANS
    const inputStockPlans = await readAndParseJSON(inputManifest.stock_plans_files[0].filepath, "notPoet");
    console.log("Adding Stock Plans to DB");
    for (const inputStockPlan of inputStockPlans.items) {
        const stockPlan = await createStockPlan(inputStockPlan);
        console.log("Stock plan added ", stockPlan);
    }

    // VALUATIONS
    const inputValuations = await readAndParseJSON(inputManifest.valuations_files[0].filepath, "notPoet");
    console.log("Adding Valuations to DB");
    for (const inputValuation of inputValuations.items) {
        const valuation = await createValuation(inputValuation);
        console.log("Valuation added ", valuation);
    }

    // VESTING TERMS
    const inputVestingTerms = await readAndParseJSON(inputManifest.vesting_terms_files[0].filepath, "notPoet");
    console.log("Adding Vesting Terms to DB");
    for (const inputVestingTerm of inputVestingTerms.items) {
        const vestingTerm = await createVestingTerms(inputVestingTerm);
        console.log("Vesting term added ", vestingTerm);
    }

    // TRANSACTIONS
    const inputTransactions = await readAndParseJSON(inputManifest.transactions_files[0].filepath, "notPoet");
    console.log("Adding Transactions to DB");
    for (const inputTransaction of inputTransactions.items) {
        const transaction = await Transactions(inputTransaction);
        console.log("Transaction added ", transaction);
    }
}

addNotPoetToDB() // Call the seed function
    .then(() => console.log("✅ Database seeded successfully"))
    .catch((err) => console.log("❌ Error seeding database:", err));
