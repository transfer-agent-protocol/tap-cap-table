const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()

async function main() {

        //TODO: only execute if running on local DB instance

        // STAKEHOLDER
        const deleteAllStakeholders = await prisma.stakeholder.deleteMany()
        console.log(`Deleted ${deleteAllStakeholders.count} stakeholders`)

        // STOCK CLASS
        const deleteAllStockClasses = await prisma.stockClass.deleteMany()
        console.log(`Deleted ${deleteAllStockClasses.count} stock classes`)

        // STOCK LEGEND
        const deleteAllStockLegends = await prisma.stockLegendTemplate.deleteMany()
        console.log(`Deleted ${deleteAllStockLegends.count} stock legends`)

        // STOCK PLANS
        const deleteAllStockPlans = await prisma.stockPlan.deleteMany()
        console.log(`Deleted ${deleteAllStockPlans.count} stock plans`)

        // VALUATIONS
        const deleteAllValuations = await prisma.valuations.deleteMany()
        console.log(`Deleted ${deleteAllValuations.count} valuations`)

        // VESTING TERMS
        const deleteAllVestingTerms = await prisma.vestingTerms.deleteMany()
        console.log(`Deleted ${deleteAllVestingTerms.count} vesting terms`)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
