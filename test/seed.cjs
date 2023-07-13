const { PrismaClient } = require("@prisma/client");
const inputStakeholders = require('../ocf/samples/Stakeholders.ocf.json') 
const inputStockClasses = require('../ocf/samples/StockClasses.ocf.json')

// manifest wraps all of these.

const prisma = new PrismaClient();

async function main() {

        // STAKEHOLDER
        console.log('Adding Stakeholder to DB')
        for (const inputStakeholder of inputStakeholders.items) {
            const stakeholder = await prisma.stakeholder.create({
                data: inputStakeholder
            }); 

            console.log('Stakeholder added ', stakeholder)
        }
    
        // STOCK CLASS
        console.log('Adding Stock Class to DB')
        for (const inputStockClass of inputStockClasses.items) {
            const stockClass = await prisma.stockClass.create({
                data: inputStockClass
            })

            console.log('Stockclass added ', stockClass)
        }


    // const issuer = await prisma.issuer.create({
    //     data: {
    //         legal_name: "Poet Network Inc.",
    //         dba: "Poet",
    //         formation_date: "2022-08-23",
    //         country_of_formation: "US",
    //         country_subdivision_of_formation: "DE",
    //         tax_ids: ["12-315-69"],
    //         email: "concierge@poet.network",
    //         phone: "212-111-111",
    //         initial_shares_authorized: "10000000",
    //     },
    // });

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
