const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { v4: uuidv4 } = require("uuid");

async function main() {
    // Generate some example data
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
            street_suite: "447 Broadway, 2nd Floor,\n#713",
            city: "New York",
            country_subdivision: "NY",
            postal_code: "10013",
            address_type: "LEGAL",
            country: "US",
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
            issuerId: issuer.id,
        },
    });

    console.log(issuer, issuerAddress, taxID);

    // Create Stock Classes
    const stockClassCommon = await prisma.stockClass.create({
        data: {
            id: uuidv4(),
            name: "Common Stock",
            class_type: "COMMON",
            default_id_prefix: "C",
            initial_shares_authorized: 1000000,
            seniority: 1,
            votes_per_share: 1.0,
        },
    });

    const stockClassPreferred = await prisma.stockClass.create({
        data: {
            id: uuidv4(),
            name: "Preferred Stock",
            class_type: "PREFERRED",
            default_id_prefix: "P",
            initial_shares_authorized: 500000,
            seniority: 2,
            votes_per_share: 0.5,
        },
    });

    const stockPlan = await prisma.stockPlan.create({
        data: {
            id: uuidv4(),
            plan_name: "Stock Plan Name",
            initial_shares_reserved: 500,
            stock_class_id: stockClassCommon.id,
        },
    });

    // Create Address for each stakeholder
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

    // Create TaxID for each stakeholder
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

    // Create Stakeholders along with their names and linked data
    const stakeholder1 = await prisma.stakeholder.create({
        data: {
            id: uuidv4(),
            stakeholder_type: "INDIVIDUAL",
            current_relationship: "FOUNDER",
            issuer_assigned_id: "POET_1",
            comments: "First Stakeholder",
            stockClass: {
                connect: {
                    id: stockClassCommon.id,
                },
            },
            issuer: {
                connect: {
                    id: issuer.id,
                },
            },
            name: {
                create: {
                    id: uuidv4(),
                    legal_name: "Alex Palmer",
                    first_name: "Alex",
                    last_name: "Palmer",
                },
            },
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
            stockClass: {
                connect: {
                    id: stockClassPreferred.id,
                },
            },
            issuer: {
                connect: {
                    id: issuer.id,
                },
            },
            name: {
                create: {
                    id: uuidv4(),
                    legal_name: "Victor Augusto Cardenas Mimo",
                    first_name: "Victor",
                    last_name: "Mimo",
                },
            },
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
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
