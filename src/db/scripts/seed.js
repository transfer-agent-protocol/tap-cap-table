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

async function processEntity(entityFile, createEntityFunction, issuerId) {
    const inputEntities = await readAndParseJSON(entityFile, "notPoet");
    console.log(`Adding ${createEntityFunction.name.replace("create", "")} to DB`);
    for (let inputEntity of inputEntities.items) {
        inputEntity = { ...inputEntity, issuer: issuerId };
        const entity = await createEntityFunction(inputEntity);
        console.log(`${createEntityFunction.name.replace("create", "")} added `, entity);
    }
}

async function addNotPoetToDB() {
    const issuer = await createIssuer(inputManifest.issuer);

    const issuerId = issuer._id;

    await processEntity(inputManifest.stakeholders_files[0].filepath, createStakeholder, issuerId);
    await processEntity(inputManifest.stock_classes_files[0].filepath, createStockClass, issuerId);
    await processEntity(inputManifest.stock_legend_templates_files[0].filepath, createStockLegendTemplate, issuerId);
    await processEntity(inputManifest.stock_plans_files[0].filepath, createStockPlan, issuerId);
    await processEntity(inputManifest.valuations_files[0].filepath, createValuation, issuerId);
    await processEntity(inputManifest.vesting_terms_files[0].filepath, createVestingTerms, issuerId);

    // TRANSACTIONS
    const transactionsFilePath = "Transactions.ocf.json";
    const transactionsData = await readAndParseJSON(transactionsFilePath, "notPoet");
    await addTransactions(transactionsData, issuerId);

    return issuer;
}

export default addNotPoetToDB;
