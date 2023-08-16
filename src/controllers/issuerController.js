import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID.js";
import Issuer from "../db/objects/Issuer.js"; // Import the Issuer model
import deployCapTable from "../custom-chain-scripts/deployCapTable.js"; // Import the deployCapTable function

// Offchain
export const getIssuerById = async (req, res) => {
    try {
        const issuer = await Issuer.findOne(); // Assuming there's only one issuer in the database
        if (!issuer) {
            return res.status(404).send("Issuer not found");
        }

        const issuerUUID = convertBytes16ToUUID(issuer._id);
        const issuerNew = {
            id: issuerUUID,
            ...issuer.toObject(), // Spread the issuer document into the object
        };

        delete issuerNew._id;

        console.log("Issuer", issuerNew);
        res.status(200).send(issuerNew);
    } catch (error) {
        console.error("Error encountered:", error);
        res.status(500).send(error);
    }
};

export const createIssuer = async (req, res) => {
    const issuer = new Issuer(req.body);

    try {
        // Save the issuer to the database
        await issuer.save();

        console.log("Issuer created:", req.body);
        res.status(200).send(issuer); // Send the saved issuer object, including the generated UUID
    } catch (error) {
        console.error("Error encountered:", error);
        res.status(500).send(error);
    }
};

// Onchain
export const reflectIssuerOnchain = async (req, res) => {
    const { contract } = req;

    // Assuming there's only one issuer in the database, similar to getIssuerById
    const issuer = await Issuer.findOne();
    if (!issuer) {
        return res.status(404).send("Issuer not found");
    }

    const issuerIdBytes16 = convertUUIDToBytes16(issuer._id);
    const issuerName = issuer.legal_name;

    try {
        // TODO: Implement logic to reflect the issuer on chain properly (this is just a placeholder that takes in our existing sample data)
        const deployedAddress = await deployCapTable(req.chain, issuerIdBytes16, issuerName);

        console.log("Issuer reflected onchain:", { issuerIdBytes16, deployedAddress });
        res.status(200).send({ issuerIdBytes16, deployedAddress });
    } catch (error) {
        console.error("Error encountered:", error);
        res.status(500).send(error);
    }
};
