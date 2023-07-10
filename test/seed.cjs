const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const issuer = await prisma.issuer.create({
        data: {
            legal_name: "Poet Network Inc.",
            formation_date: "2022-08-23",
            country_of_formation: "US",
            country_subdivision_of_formation: "DE",
            initial_shares_authorized: 10000000,
        },
    });

    const name1 = await prisma.name.create({
        data: {
            legal_name: "Alex Palmer",
            first_name: "Alex",
            last_name: "Palmer",
        },
    });

    const name2 = await prisma.name.create({
        data: {
            legal_name: "Victor Augusto Cardenas Mimo",
            first_name: "Victor",
            last_name: "Mimo",
        },
    });

    const stakeholder1 = await prisma.stakeholder.create({
        data: {
            stakeholder_type: "INDIVIDUAL",
            current_relationship: "FOUNDER",
            issuer_assigned_id: "POET_1",
            comments: "First Stakeholder",
            issuerId: issuer.id,
            nameId: name1.id, // Use the retrieved name1.id here
        },
    });

    const stakeholder2 = await prisma.stakeholder.create({
        data: {
            stakeholder_type: "INDIVIDUAL",
            current_relationship: "FOUNDER",
            issuer_assigned_id: "POET_2",
            comments: "Second Stakeholder",
            issuerId: issuer.id,
            nameId: name2.id, // Use the retrieved name2.id here
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
