import issuerSchema from "../../../ocf/schema/objects/Issuer.schema.json" assert { type: "json" };
import stakeholderSchema from "../../../ocf/schema/objects/Stakeholder.schema.json" assert { type: "json" };
import stockClassSchema from "../../../ocf/schema/objects/StockClass.schema.json" assert { type: "json" };
import stockLegendTemplateSchema from "../../../ocf/schema/objects/StockLegendTemplate.schema.json" assert { type: "json" };
import stockPlanSchema from "../../../ocf/schema/objects/StockPlan.schema.json" assert { type: "json" };
import valuationSchema from "../../../ocf/schema/objects/Valuation.schema.json" assert { type: "json" };
import vestingTermsSchema from "../../../ocf/schema/objects/VestingTerms.schema.json" assert { type: "json" };
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

import validateInputAgainstOCF from "../../utils/validateInputAgainstSchema.js";

async function processEntity(inputEntities, createEntityFunction, schema, issuerId) {
    console.log(`Adding ${createEntityFunction.name.replace("create", "")} to DB`);
    for (let inputEntity of inputEntities.items) {
        await validateInputAgainstOCF(inputEntity, schema);
        inputEntity = { ...inputEntity, issuer: issuerId };
        const entity = await createEntityFunction(inputEntity);
        console.log(`${createEntityFunction.name.replace("create", "")} added `, entity);
    }
}

// 1. process issuer, save to DB
// 2. process other files, save to DB
// 3. process transactions, save to DB
// 4. mint cap table
// 5. on IssuerCreated event, create the stakeholders, stock classes, etc onchain
// 6. on IssuerCreated event, mint transactions with DB data. Save again on those events

async function seedDB(manifestArr) {
    let incomingIssuer;
    let incomingStakeholders;
    let incomingStockClasses;
    let incomingStockLegendTemplates;
    let incomingStockPlans;
    let incomingValuations;
    let incomingVestingTerms;
    let incomingTransactions;

    manifestArr.forEach((file) => {
        if (file.issuer) incomingIssuer = file.issuer;
        if (file.file_type === "OCF_STAKEHOLDERS_FILE") incomingStakeholders = file;
        if (file.file_type === "OCF_STOCK_CLASSES_FILE") incomingStockClasses = file;
        if (file.file_type === "OCF_STOCK_LEGEND_TEMPLATES_FILE") incomingStockLegendTemplates = file;
        if (file.file_type === "OCF_STOCK_PLANS_FILE") incomingStockPlans = file;
        if (file.file_type === "OCF_VALUATIONS_FILE") incomingValuations = file;
        if (file.file_type === "OCF_VESTING_TERMS_FILE") incomingVestingTerms = file;
        if (file.file_type === "OCF_TRANSACTIONS_FILE") incomingTransactions = file;
    });

    await validateInputAgainstOCF(incomingIssuer, issuerSchema);
    const issuer = await createIssuer(incomingIssuer);

    const issuerId = issuer._id;

    await processEntity(incomingStakeholders, createStakeholder, stakeholderSchema, issuerId);
    await processEntity(incomingStockClasses, createStockClass, stockClassSchema, issuerId);
    await processEntity(incomingStockLegendTemplates, createStockLegendTemplate, stockLegendTemplateSchema, issuerId);
    await processEntity(incomingStockPlans, createStockPlan, stockPlanSchema, issuerId);
    await processEntity(incomingValuations, createValuation, valuationSchema, issuerId);
    await processEntity(incomingVestingTerms, createVestingTerms, vestingTermsSchema, issuerId);

    // TRANSACTIONS
    await addTransactions(incomingTransactions, issuerId);

    return issuer;
}

export default seedDB;
