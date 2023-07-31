const { PrismaClient } = require("@prisma/client");
const readAndParseJSON = require("./utils/readAndParseJson.cjs");

// OCF Provided Sample
const inputManifest = require("../ocf/samples/Manifest.ocf.json");

const transactionTests = require("./objects/transactions.cjs");

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

    // VALUATIONS
    const inputValuations = await readAndParseJSON(inputManifest.valuations_files[0].filepath);
    console.log("Adding Valuations to DB");
    for (const inputValuation of inputValuations.items) {
        const valuation = await prisma.valuations.create({
            data: inputValuation,
        });
        console.log("Valuation added ", valuation);
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
