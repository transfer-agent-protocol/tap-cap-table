import { Router } from "express";
import { convertBytes16ToUUID } from "../utils/convertUUID.js";

const issuer = Router();

issuer.get("/fetch", async (req, res) => {
    const { contract } = req;
    const issuer = await contract.issuer();
    const issuerUUID = convertBytes16ToUUID(issuer.id);
    console.log("Issuer", issuer);
    const issuerNew = {
        id: issuerUUID,
        legal_name: issuer.legal_name,
    };
    res.status(200).send(issuerNew);
});

export default issuer;
