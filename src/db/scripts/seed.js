import readAndParseJSON from "../../utils/readAndParseJson.js";
import {
    createIssuer,
    createStakeholder,
    createStockClass,
    createStockLegendTemplate,
    createStockPlan,
    createValuation,
    createVestingTerms,
} from "../operations/create.js";
import addTransactions from "../operations/transactions.js"; // Import addTransactions
import inputManifest from "../samples/notPoet/Manifest.ocf.json" assert { type: "json" };

async function processEntity(entityFile, createEntityFunction) {
    const inputEntities = await readAndParseJSON(entityFile, "notPoet");
    console.log(`Adding ${createEntityFunction.name.replace("create", "")} to DB`);
    for (const inputEntity of inputEntities.items) {
        const entity = await createEntityFunction(inputEntity);
        console.log(`${createEntityFunction.name.replace("create", "")} added `, entity);
    }
}

async function addNotPoetToDB() {
    const issuer = await createIssuer(inputManifest.issuer);
    console.log("Issuer added ", issuer);

    await processEntity(inputManifest.stakeholders_files[0].filepath, createStakeholder);
    await processEntity(inputManifest.stock_classes_files[0].filepath, createStockClass);
    await processEntity(inputManifest.stock_legend_templates_files[0].filepath, createStockLegendTemplate);
    await processEntity(inputManifest.stock_plans_files[0].filepath, createStockPlan);
    await processEntity(inputManifest.valuations_files[0].filepath, createValuation);
    await processEntity(inputManifest.vesting_terms_files[0].filepath, createVestingTerms);

    // TRANSACTIONS
    const transactionsFilePath = "Transactions.ocf.json";
    const transactionsData = await readAndParseJSON(transactionsFilePath, "notPoet");
    await addTransactions(transactionsData); // Use addTransactions function here

    return issuer;
}

export default addNotPoetToDB;
