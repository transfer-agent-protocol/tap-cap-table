const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
    const issuer = await prisma.issuer.create({
        data: {
            id: uuidv4(),
            legal_name: "Poet Network Inc.",
            formation_date: "2022-08-23",
            country_of_formation: "US",
            country_subdivision_of_formation: "DE",
            initial_shares_authorized: 10000000,
        },
    });

    const issuerAddress = await prisma.address.create({
        data: {
            id: uuidv4(),
            address_type: "LEGAL",
            street_suite: "447 Broadway, 2nd Floor,\n#713",
            city: "New York",
            country_subdivision: "NY",
            country: "US",
            postal_code: "10013",
            issuers: {
                connect: {
                    id: issuer.id,
                },
            },
        },
    });

    const taxID = await prisma.taxID.create({
        data: {
            id: uuidv4(),
            tax_id: "123-45-6789",
            country: "US",
            Issuer: {
                connect: {
                    id: issuer.id,
                },
            },
        },
    });

    console.log(issuer, issuerAddress, taxID);

    const stockClassCommon = await prisma.stockClass.create({
        data: {
            id: uuidv4(),
            name: "Common Stock",
            class_type: "COMMON",
            default_id_prefix: "CS",
            initial_shares_authorized: 4000000,
            board_approval_date: "2022-08-23",
            stockholder_approval_date: "2022-08-23",
            seniority: 1,
            votes_per_share: 1.0,
            par_value: 0.0001,
            liquidation_preference_multiple: 1,
            participation_cap_multiple: 1,
            issuerId: issuer.id,
        },
    });

    const stockClassPreferred = await prisma.stockClass.create({
        data: {
            id: uuidv4(),
            name: "Preferred Stock",
            class_type: "PREFERRED",
            default_id_prefix: "PS",
            initial_shares_authorized: 4000000,
            seniority: 1,
            votes_per_share: 1.0,
            par_value: 0.0001,
            liquidation_preference_multiple: 1,
            participation_cap_multiple: 1,
            issuerId: issuer.id,
        },
    });

    const stockPlan = await prisma.stockPlan.create({
        data: {
            id: uuidv4(),
            plan_name: "2023 Restated Stock Plan",
            initial_shares_reserved: 1000000,
            board_approval_date: "2022-08-23",
            stockholder_approval_date: "2022-08-23",
            stock_class: {
                connect: {
                    id: stockClassCommon.id,
                },
            },
            comments: "Restated option plan for 2023",
        },
    });

    console.log(stockClassCommon, stockClassPreferred, stockPlan);

    const address1 = await prisma.address.create({
        data: {
            id: uuidv4(),
            street_suite: "123 Main Street",
            city: "New York",
            country_subdivision: "NY",
            country: "US",
            postal_code: "10001",
            address_type: "CONTACT",
        },
    });

    const address2 = await prisma.address.create({
        data: {
            id: uuidv4(),
            street_suite: "456 Elm Street",
            city: "San Francisco",
            country_subdivision: "CA",
            country: "US",
            postal_code: "94101",
            address_type: "CONTACT",
        },
    });

    const taxId1 = await prisma.taxID.create({
        data: {
            id: uuidv4(),
            tax_id: "123-456-789",
            country: "US",
        },
    });

    const taxId2 = await prisma.taxID.create({
        data: {
            id: uuidv4(),
            tax_id: "987-654-321",
            country: "US",
        },
    });

    const name1 = await prisma.name.create({
        data: {
            id: uuidv4(),
            legal_name: "Alex Palmer",
            first_name: "Alex",
            last_name: "Palmer",
        },
    });

    const name2 = await prisma.name.create({
        data: {
            id: uuidv4(),
            legal_name: "Victor Augusto Cardenas Mimo",
            first_name: "Victor",
            last_name: "Mimo",
        },
    });

    const stakeholder1 = await prisma.stakeholder.create({
        data: {
            id: uuidv4(),
            stakeholder_type: "INDIVIDUAL",
            current_relationship: "FOUNDER",
            issuer_assigned_id: "POET_1",
            comments: "First Stakeholder",
            stockClassId: stockClassCommon.id,
            issuerId: issuer.id,
            nameId: name1.id, // Use the retrieved name1.id here
            addresses: {
                connect: {
                    id: address1.id,
                },
            },
            tax_ids: {
                connect: {
                    id: taxId1.id,
                },
            },
        },
    });

    const stakeholder2 = await prisma.stakeholder.create({
        data: {
            id: uuidv4(),
            stakeholder_type: "INDIVIDUAL",
            current_relationship: "FOUNDER",
            issuer_assigned_id: "POET_2",
            comments: "Second Stakeholder",
            stockClassId: stockClassPreferred.id,
            issuerId: issuer.id,
            nameId: name2.id, // Use the retrieved name2.id here
            addresses: {
                connect: {
                    id: address2.id,
                },
            },
            tax_ids: {
                connect: {
                    id: taxId2.id,
                },
            },
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
