const { PrismaClient } = require("@prisma/client");
const fs = require("fs").promises;
const path = require("path");

const inputManifest = require("./poet/Manifest.ocf.json");

const transactionTests = require("./objects/transactions.cjs");

async function readAndParseJSON(inputPath) {
    const dataPath = path.join("./test/poet", inputPath);
    try {
        const data = await fs.readFile(dataPath, "utf8");
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error(`Error reading file: ${err}`);
    }
}

const prisma = new PrismaClient();

async function main() {
    const inputIssuer = inputManifest.issuer;
    const issuer = await prisma.issuer.create({ data: inputIssuer });

    console.log("Issuer added ", issuer);

    // TODO: Each of these categories are arrays of files inside of the manifest.

    // STOCK PLANS
    const inputStockPlans = await readAndParseJSON(inputManifest.stock_plans_files[0].filepath);
    console.log("Adding Stock Plans to DB");
    for (const inputStockPlan of inputStockPlans.items) {
        const stockPlan = await prisma.stockPlan.create({
            data: inputStockPlan,
        });

        console.log("Stock plan added ", stockPlan);
    }

    // STOCK LEGENDS
    const inputStockLegends = await readAndParseJSON(inputManifest.stock_legend_templates_files[0].filepath);
    console.log("Adding Stock Legends to DB");
    for (const inputStockLegend of inputStockLegends.items) {
        const stockLegend = await prisma.stockLegendTemplate.create({
            data: inputStockLegend,
        });

        console.log("Stock legend added ", stockLegend);
    }

    // STOCK CLASS
    const inputStockClasses = await readAndParseJSON(inputManifest.stock_classes_files[0].filepath);
    console.log("Adding Stock Classes to DB");
    for (const inputStockClass of inputStockClasses.items) {
        const stockClass = await prisma.stockClass.create({
            data: inputStockClass,
        });

        console.log("Stock classes added ", stockClass);
    }

    // TRANSACTIONS
    const inputTransactions = await readAndParseJSON(inputManifest.transactions_files[0].filepath);
    console.log("Adding Transactions to DB");
    const transactions = await transactionTests(inputTransactions, prisma);

    // STAKEHOLDERS
    const inputStakeholders = await readAndParseJSON(inputManifest.stakeholders_files[0].filepath);
    console.log("Adding Stakeholders to DB");
    for (const inputStakeholder of inputStakeholders.items) {
        const stakeholder = await prisma.stakeholder.create({
            data: inputStakeholder,
        });

        console.log("Stakeholder added ", stakeholder);
    }

    // VESTING TERMS
    const inputVestingTerms = await readAndParseJSON(inputManifest.vesting_terms_files[0].filepath);
    console.log("Adding Vesting Terms to DB");
    for (const inputVestingTerm of inputVestingTerms.items) {
        const vestingTerm = await prisma.vestingTerms.create({
            data: inputVestingTerm,
        });

        console.log("Vesting term added ", vestingTerm);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
