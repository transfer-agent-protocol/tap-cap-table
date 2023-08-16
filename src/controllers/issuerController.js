import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import Issuer from "../db/objects/Issuer.js"; // Import the Issuer model

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
