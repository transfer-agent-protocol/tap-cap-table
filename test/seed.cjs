const { PrismaClient } = require("@prisma/client");
const inputStakeholders = require('../ocf/samples/Stakeholders.ocf.json') 
const inputStockClasses = require('../ocf/samples/StockClasses.ocf.json')
const inputStockLegends = require('../ocf/samples/StockLegends.ocf.json')
const inputStockPlans = require('../ocf/samples/StockPlans.ocf.json')
const inputValuations = require('../ocf/samples/Valuations.ocf.json')
const inputVestingTerms = require('../ocf/samples/VestingTerms.ocf.json')

// manifest wraps all of these.

const prisma = new PrismaClient();

async function main() {

        // STAKEHOLDER
        console.log('Adding Stakeholders to DB')
        for (const inputStakeholder of inputStakeholders.items) {
            const stakeholder = await prisma.stakeholder.create({
                data: inputStakeholder
            }); 

            console.log('Stakeholder added ', stakeholder)
        }
    
        // STOCK CLASS
        console.log('Adding Stock Classes to DB')
        for (const inputStockClass of inputStockClasses.items) {
            const stockClass = await prisma.stockClass.create({
                data: inputStockClass
            })

            console.log('Stockclass added ', stockClass)
        }

        // STOCK LEGEND
        console.log('Adding Stock Legends to DB')
        for (const inputStockLegend of inputStockLegends.items) {
            const stockLegend = await prisma.stockLegendTemplate.create({
                data: inputStockLegend
            })

            console.log('Stock legend added ', stockLegend)
        }

        // STOCK PLANS
        console.log('Adding Stock Plans to DB')
        for (const inputStockPlan of inputStockPlans.items) {
            const stockPlan = await prisma.stockPlan.create({
                data: inputStockPlan
            })

            console.log('Stock plan added ', stockPlan)
        }

        // VALUATIONS
        console.log('Adding Valuations to DB')
        for (const inputValuation of inputValuations.items) {
            const valuation = await prisma.valuations.create({
                data: inputValuation
            })

            console.log('Valuation added ', valuation)
        }

        // VESTING TERMS
        console.log('Adding Vesting Terms to DB')
        for (const inputVestingTerm of inputVestingTerms.items) {
            const vestingTerm = await prisma.vestingTerms.create({
                data: inputVestingTerm
            })

            console.log('Vesting term added ', vestingTerm)
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
