const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    //TODO: only execute if running on local DB instance

    // ISSUER
    const deleteIssuer = await prisma.issuer.deleteMany();
    console.log(`Deleted ${deleteIssuer.count} issuers`);

    // STAKEHOLDER
    const deleteAllStakeholders = await prisma.stakeholder.deleteMany();
    console.log(`Deleted ${deleteAllStakeholders.count} stakeholders`);

    // STOCK CLASS
    const deleteAllStockClasses = await prisma.stockClass.deleteMany();
    console.log(`Deleted ${deleteAllStockClasses.count} stock classes`);

    // STOCK LEGEND
    const deleteAllStockLegends = await prisma.stockLegendTemplate.deleteMany();
    console.log(`Deleted ${deleteAllStockLegends.count} stock legends`);

    // STOCK PLANS
    const deleteAllStockPlans = await prisma.stockPlan.deleteMany();
    console.log(`Deleted ${deleteAllStockPlans.count} stock plans`);

    // VALUATIONS
    const deleteAllValuations = await prisma.valuations.deleteMany();
    console.log(`Deleted ${deleteAllValuations.count} valuations`);

    // VESTING TERMS
    const deleteAllVestingTerms = await prisma.vestingTerms.deleteMany();
    console.log(`Deleted ${deleteAllVestingTerms.count} vesting terms`);

    // *** TRANSACTIONS *** //

    // ACCEPTANCE
    const deleteConvertibleAcceptance = await prisma.convertibleAcceptance.deleteMany();
    console.log(`Deleted ${deleteConvertibleAcceptance.count} convertible acceptances`);

    const deleteEquityCompensationAcceptance = await prisma.equityCompensationAcceptance.deleteMany();
    console.log(`Deleted ${deleteEquityCompensationAcceptance.count} equity compensation acceptances`);

    const deletePlanSecurityAcceptance = await prisma.planSecurityAcceptance.deleteMany();
    console.log(`Deleted ${deletePlanSecurityAcceptance.count} plan security acceptances`);

    const deleteStockAcceptance = await prisma.stockAcceptance.deleteMany();
    console.log(`Deleted ${deleteStockAcceptance.count} stock acceptances`);

    const deleteWarrantAcceptance = await prisma.warrantAcceptance.deleteMany();
    console.log(`Deleted ${deleteWarrantAcceptance.count} warranty acceptances`);

    // ISSUANCE
    const deleteConvertibleIssuance = await prisma.convertibleIssuance.deleteMany();
    console.log(`Deleted ${deleteConvertibleIssuance.count} convertible issuances`);

    const deleteEquityCompensationIssuance = await prisma.equityCompensationIssuance.deleteMany();
    console.log(`Deleted ${deleteEquityCompensationIssuance.count} equity compensation issuances`);

    const deletePlanSecurityIssuance = await prisma.planSecurityIssuance.deleteMany();
    console.log(`Deleted ${deletePlanSecurityIssuance.count} plan security issuances`);

    const deleteStockIssuance = await prisma.stockIssuance.deleteMany();
    console.log(`Deleted ${deleteStockIssuance.count} stock issuances`);

    const deleteWarrantIssuance = await prisma.warrantIssuance.deleteMany();
    console.log(`Deleted ${deleteWarrantIssuance.count} warrant issuances`);

    // CONVERSION
    const deleteConvertibleConversion = await prisma.convertibleConversion.deleteMany();
    console.log(`Deleted ${deleteConvertibleConversion.count} convertible conversions`);

    const deleteStockConversion = await prisma.stockConversion.deleteMany();
    console.log(`Deleted ${deleteStockConversion.count} stock conversions`);

    // VESTING
    const deleteVestingStart = await prisma.vestingStart.deleteMany();
    console.log(`Deleted ${deleteVestingStart.count} vesting starts`);

    const deleteVestingEvent = await prisma.vestingEvent.deleteMany();
    console.log(`Deleted ${deleteVestingEvent.count} vesting events`);

    const deleteVestingAcceleration = await prisma.vestingAcceleration.deleteMany();
    console.log(`Deleted ${deleteVestingAcceleration.count} vesting accelerations`);

    // CANCELLATION
    const deleteConvertibleCancellation = await prisma.convertibleCancellation.deleteMany();
    console.log(`Deleted ${deleteConvertibleCancellation.count} convertible cancellations`);

    const deleteEquityCompensationCancellation = await prisma.equityCompensationCancellation.deleteMany();
    console.log(`Deleted ${deleteEquityCompensationCancellation.count} equity compensation cancellations`);

    const deletePlanSecurityCancellation = await prisma.planSecurityCancellation.deleteMany();
    console.log(`Deleted ${deletePlanSecurityCancellation.count} plan security cancellations`);

    const deleteStockCancellation = await prisma.stockCancellation.deleteMany();
    console.log(`Deleted ${deleteStockCancellation.count} stock cancellations`);

    const deleteWarrantCancellation = await prisma.warrantCancellation.deleteMany();
    console.log(`Deleted ${deleteWarrantCancellation.count} warrant cancellations`);

    // TRANSFER
    const deleteConvertibleTransfer = await prisma.convertibleTransfer.deleteMany();
    console.log(`Deleted ${deleteConvertibleTransfer.count} convertible transfers`);

    const deleteEquityCompensationTransfer = await prisma.equityCompensationTransfer.deleteMany();
    console.log(`Deleted ${deleteEquityCompensationTransfer.count} equity compensation transfers`);

    const deletePlanSecurityTransfer = await prisma.planSecurityTransfer.deleteMany();
    console.log(`Deleted ${deletePlanSecurityTransfer.count} plan security transfers`);

    const deleteStockTransfer = await prisma.stockTransfer.deleteMany();
    console.log(`Deleted ${deleteStockTransfer.count} stock transfers`);

    const deleteWarrantTransfer = await prisma.warrantTransfer.deleteMany();
    console.log(`Deleted ${deleteWarrantTransfer.count} warrant transfers`);

    console.assert("dsd");

    // RELEASE
    const deleteEquityCompensationRelease = await prisma.equityCompensationRelease.deleteMany();
    console.log(`Deleted ${deleteEquityCompensationRelease.count} equity compensation releases`);

    const deletePlanSecurityRelease = await prisma.planSecurityRelease.deleteMany();
    console.log(`Deleted ${deletePlanSecurityRelease.count} plan security releases`);

    // EXERCISE
    const deleteEquityCompensationExercise = await prisma.equityCompensationExercise.deleteMany();
    console.log(`Deleted ${deleteEquityCompensationExercise.count} equity compensation exercises`);

    const deletePlanSecurityExercise = await prisma.planSecurityExercise.deleteMany();
    console.log(`Deleted ${deletePlanSecurityExercise.count} plan security exercises`);

    const deleteWarrantExercise = await prisma.warrantExercise.deleteMany();
    console.log(`Deleted ${deleteWarrantExercise.count} warrant exercises`);

    // REISSUANCE
    const deleteStockReissuance = await prisma.stockReissuance.deleteMany();
    console.log(`Deleted ${deleteStockReissuance.count} stock reissuances`);

    // REPURCHASE
    const deleteStockRepurchase = await prisma.stockRepurchase.deleteMany();
    console.log(`Deleted ${deleteStockRepurchase.count} stock repurchases`);

    // RETURN TO POOL
    const deleteStockPlanReturnToPool = await prisma.stockPlanReturnToPool.deleteMany();
    console.log(`Deleted ${deleteStockPlanReturnToPool.count} stock plan returns to pool`);

    // SPLIT
    const deleteStockClassSplit = await prisma.stockClassSplit.deleteMany();
    console.log(`Deleted ${deleteStockClassSplit.count} stock class splits`);

    // RETRACTION
    const deleteConvertibleRetraction = await prisma.convertibleRetraction.deleteMany();
    console.log(`Deleted ${deleteConvertibleRetraction.count} convertible retractions`);

    const deleteEquityCompensationRetraction = await prisma.equityCompensationRetraction.deleteMany();
    console.log(`Deleted ${deleteEquityCompensationRetraction.count} equity compensation retractions`);

    const deletePlanSecurityRetraction = await prisma.planSecurityRetraction.deleteMany();
    console.log(`Deleted ${deletePlanSecurityRetraction.count} plan security retractions`);

    const deleteStockRetraction = await prisma.stockRetraction.deleteMany();
    console.log(`Deleted ${deleteStockRetraction.count} stock retractions`);

    const deleteWarrantRetraction = await prisma.warrantRetraction.deleteMany();
    console.log(`Deleted ${deleteWarrantRetraction.count} warrant retractions`);

    // ADJUSTMENT
    const deleteIssuerAuthorizedSharesAdjustment = await prisma.issuerAuthorizedSharesAdjustment.deleteMany();
    console.log(`Deleted ${deleteIssuerAuthorizedSharesAdjustment.count} issuer authorized shares adjustments`);

    const deleteStockClassAuthorizedSharesAdjustment = await prisma.stockClassAuthorizedSharesAdjustment.deleteMany();
    console.log(`Deleted ${deleteStockClassAuthorizedSharesAdjustment.count} stock class authorized shares adjustments`);

    const deleteStockClassConversionRatioAdjustment = await prisma.stockClassConversionRatioAdjustment.deleteMany();
    console.log(`Deleted ${deleteStockClassConversionRatioAdjustment.count} stock class conversion ratio adjustments`);

    const deleteStockPlanPoolAdjustment = await prisma.stockPlanPoolAdjustment.deleteMany();
    console.log(`Deleted ${deleteStockPlanPoolAdjustment.count} stock plan pool adjustments`);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
