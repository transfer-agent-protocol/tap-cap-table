import { Router } from "express";
import Issuer from "../db/objects/Issuer";
import Stakeholder from "../db/objects/Stakeholder";
import StockClass from "../db/objects/StockClass";
import { StockIssuance } from "../db/objects/transactions/issuance";
import { getIssuerContract } from "../utils/caches";
import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID";

export const capTable = Router();

capTable.get("/", async (req, res) => {
    res.send("Hello Cap Table!");
});

capTable.get("/latest", async (req, res) => {
    const issuerId = req.query.issuerId;
    try {
        const stakeholders = await Stakeholder.find({issuer: issuerId});
        const issuances = await StockIssuance.find({issuer: issuerId});
        const stockClasses = await StockClass.find({issuer: issuerId});
        const issuer = await Issuer.findById(issuerId);
        const {contract} = await getIssuerContract(issuer);
        
        // TODO: switch to array of promises for speed
        let holdings = [];
        for (const stakeholder of stakeholders) {
            for (const issuance of issuances) {
                const issuanceId = issuance._id;
                const stakeholderId = stakeholder._id;
                const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
                const secIdBytes16 = convertUUIDToBytes16(issuance.security_id);
                const [stockClassIdBytes16, quantity, sharePrice, timestamp] = await contract.getActivePosition(
                    stakeHolderIdBytes16,
                    secIdBytes16,
                );
                const stockClassId = convertBytes16ToUUID(stockClassIdBytes16);
                holdings.push({
                    stockClassId,
                    quantity: Number(quantity),
                    sharePrice: Number(sharePrice),
                    timestamp: Number(timestamp),
                    stakeholderId,
                    issuanceId,
                });
            }
        }

        // TODO: munging on server side
        res.send({ stakeholders, holdings, stockClasses, issuances });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
})
