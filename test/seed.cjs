const { PrismaClient } = require("@prisma/client");
const inputStakeholders = require('./stakeholders.json')


const prisma = new PrismaClient();

async function main() {

    if(inputStakeholders.file_type === "OCF_STAKEHOLDERS_FILE") {
        console.log('Adding stakeholder to DB')

        for (const inputStakeholder of inputStakeholders.items) {
            const stakeholder = await prisma.stakeholder.create({
                data: inputStakeholder
            }); 

            console.log('Stakeholder added ', stakeholder)
        }

    } else {
        console.log('Data does not match a known object')
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
