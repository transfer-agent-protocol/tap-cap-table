const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { v4: uuidv4 } = require("uuid");

async function main() {
    // Generate some example data
    const issuer = await prisma.issuer.create({
        data: {
            id: uuidv4(),
            legal_name: "XYZ Corp",
            formation_date: new Date(),
            country_of_formation: "US",
            initial_shares_authorized: 6000000,
        },
    });

    const address = await prisma.address.create({
        data: {
            id: uuidv4(),
            street: "123 Main Street",
            city: "New York",
            state: "New York",
            zip: "12345",
            type: "LEGAL",
            Issuer: {
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

    console.log({ stockClassCommon, stockClassPreferred });

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
            street: "123 Main Street",
            city: "New York",
            state: "NY",
            zip: "10001",
            type: "CONTACT",
        },
    });

    const address2 = await prisma.address.create({
        data: {
            id: uuidv4(),
            street: "456 Elm Street",
            city: "San Francisco",
            state: "CA",
            zip: "94101",
            type: "CONTACT",
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
            current_relationship: "EMPLOYEE",
            issuer_assigned_id: "issuer_1",
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
                    legal_name: "John Doe",
                    first_name: "John",
                    last_name: "Doe",
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
            stakeholder_type: "INSTITUTION",
            current_relationship: "INVESTOR",
            issuer_assigned_id: "issuer_2",
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
                    legal_name: "XYZ Corp",
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

    console.log({ stakeholder1, stakeholder2 });
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
