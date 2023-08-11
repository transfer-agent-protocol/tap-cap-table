import readAndParseJSON from "../utils/readAndParseJson.js";

import inputManifest from "./samples/notPoet/Manifest.ocf.json" assert { type: "json" };
import transactionTests from "./objects/transactions.js";

async function addNotPoetToDB(prisma) {
    const inputIssuer = inputManifest.issuer;
    const issuer = await prisma.issuer.create({ data: inputIssuer });

    console.log("Issuer added ", issuer);

    // TODO: Each of these categories are arrays of files inside of the manifest. We're using the first element for now since there's only one for Poet.

    // STOCK PLANS
    const inputStockPlans = await readAndParseJSON(inputManifest.stock_plans_files[0].filepath, "notPoet");
    console.log("Adding Stock Plans to DB");
    for (const inputStockPlan of inputStockPlans.items) {
        const stockPlan = await prisma.stockPlan.create({
            data: inputStockPlan,
        });

        console.log("Stock plan added ", stockPlan);
    }

    // STOCK LEGENDS
    const inputStockLegends = await readAndParseJSON(inputManifest.stock_legend_templates_files[0].filepath, "notPoet");
    console.log("Adding Stock Legends to DB");
    for (const inputStockLegend of inputStockLegends.items) {
        const stockLegend = await prisma.stockLegendTemplate.create({
            data: inputStockLegend,
        });

        console.log("Stock legend added ", stockLegend);
    }

    // STOCK CLASS
    const inputStockClasses = await readAndParseJSON(inputManifest.stock_classes_files[0].filepath, "notPoet");
    console.log("Adding Stock Classes to DB");
    for (const inputStockClass of inputStockClasses.items) {
        const stockClass = await prisma.stockClass.create({
            data: inputStockClass,
        });

        console.log("Stock classes added ", stockClass);
    }

    // TRANSACTIONS
    const inputTransactions = await readAndParseJSON(inputManifest.transactions_files[0].filepath, "notPoet");
    console.log("Adding Transactions to DB");
    const transactions = await transactionTests(inputTransactions, prisma);

    // STAKEHOLDERS
    const inputStakeholders = await readAndParseJSON(inputManifest.stakeholders_files[0].filepath, "notPoet");
    console.log("Adding Stakeholders to DB");
    for (const inputStakeholder of inputStakeholders.items) {
        const stakeholder = await prisma.stakeholder.create({
            data: inputStakeholder,
        });

        console.log("Stakeholder added ", stakeholder);
    }

    // VESTING TERMS
    const inputVestingTerms = await readAndParseJSON(inputManifest.vesting_terms_files[0].filepath, "notPoet");
    console.log("Adding Vesting Terms to DB");
    for (const inputVestingTerm of inputVestingTerms.items) {
        const vestingTerm = await prisma.vestingTerms.create({
            data: inputVestingTerm,
        });

        console.log("Vesting term added ", vestingTerm);
    }
}

export default addNotPoetToDB;
