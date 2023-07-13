const { PrismaClient } = require("@prisma/client");
const stakeholdersJson = require('./stakeholders.json')


const prisma = new PrismaClient();

async function main() {

    if(stakeholdersJson.file_type === "OCF_STAKEHOLDERS_FILE") {
        console.log('Adding stakeholder to DB')

        const stakeholderData = stakeholdersJson.items[0]

        const stakeholderDb = await prisma.stakeholder.create({
            data: stakeholderData
        });

        console.log('Stakeholder added ', stakeholderDb)

    } else {
        console.log('Data does not match a known object')
    }
   


    // const stakeholder2 = await prisma.stakeholder.create({
    //     data: {
    //         name: {
    //             legal_name: "Victor Augusto Cardenas Mimo",
    //             first_name: "Victor Augusto",
    //             last_name: "Cardenas Mimo",
    //         },
    //         stakeholder_type: "INDIVIDUAL",
    //         current_relationship: "FOUNDER",
    //         issuer_assigned_id: "POET_2",
    //         comments: "Second Stakeholder",
    //     },
    // });

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
