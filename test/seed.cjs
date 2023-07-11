const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const issuer = await prisma.issuer.create({
        data: {
            legal_name: "Poet Network Inc.",
            dba: "Poet",
            formation_date: "2022-08-23",
            country_of_formation: "US",
            country_subdivision_of_formation: "DE",
            tax_ids: "12-315-69",
            email: "concierge@poet.network",
            phone: "212-111-111",
            initial_shares_authorized: "10000000",
        },
    });

    const stakeholder1 = await prisma.stakeholder.create({
        data: {
            name: {
                legal_name: "Alex Palmer",
                first_name: "Alex",
                last_name: "Palmer"
            }, 
            stakeholder_type: "INDIVIDUAL",
            current_relationship: "FOUNDER",
            issuer_assigned_id: "POET_1",
            comments: "First Stakeholder",
      },
    });

    const stakeholder2 = await prisma.stakeholder.create({
        data: {
            name: {
                legal_name: "Victor Augusto Cardenas Mimo",
                first_name: "Victor Augusto",
                last_name: "Cardenas Mimo"
            },
            stakeholder_type: "INDIVIDUAL",
            current_relationship: "FOUNDER",
            issuer_assigned_id: "POET_2",
            comments: "Second Stakeholder",
        },
    });

    console.log(stakeholder1, stakeholder2);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
