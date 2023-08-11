import connectDB from "./config/mongoose.js";
import { createIssuer } from "./operations/create.js";

connectDB();

const issuerData = {
    object_type: "ISSUER",
    id: "d3373e0a-4dd9-430f-8a56-3281f2800e1e",
    legal_name: "Poet Network Inc.",
    formation_date: "2022-08-23",
    country_of_formation: "US",
    country_subdivision_of_formation: "DE",
    tax_ids: [
        {
            tax_id: "88-3977591",
            country: "US",
        },
    ],
    email: {
        email_address: "concierge@poet.network",
        email_type: "BUSINESS",
    },
    address: {
        address_type: "LEGAL",
        street_suite: "447 Broadway\n2nd Fl #713",
        city: "New York",
        country_subdivision: "NY",
        country: "US",
        postal_code: "10013",
    },
    comments: [],
};

createIssuer(issuerData)
    .then((issuer) => console.log("Issuer created:", issuer))
    .catch((err) => console.log("Error creating issuer:", err));
