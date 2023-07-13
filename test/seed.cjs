const { PrismaClient } = require("@prisma/client");
const inputStakeholders = require('../ocf/samples/Stakeholders.ocf.json') 
const inputStockClasses = require('../ocf/samples/StockClasses.ocf.json')
const inputStockLegends = require('../ocf/samples/StockLegends.ocf.json')
const inputStockPlans = require('../ocf/samples/StockPlans.ocf.json')
const inputValuations = require('../ocf/samples/Valuations.ocf.json')

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

        // STOCK PLAN
        console.log('Adding Stock Plan to DB')
        for (const inputStockPlan of inputStockPlans.items) {
            const stockPlan = await prisma.stockPlan.create({
                data: inputStockPlan
            })

            console.log('Stock plan added ', stockPlan)
        }

        // VALUATION
        console.log('Adding Valuation to DB')
        for (const inputValuation of inputValuations.items) {
            const valuation = await prisma.valuation.create({
                data: inputValuation
            })

            console.log('Valuation added ', valuation)
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
