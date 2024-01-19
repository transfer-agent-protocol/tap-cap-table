import { Router } from "express";
import Issuer from "../db/objects/Issuer";
import Stakeholder from "../db/objects/Stakeholder";
import StockClass from "../db/objects/StockClass";
import { StockIssuance } from "../db/objects/transactions/issuance";
import { getIssuerContract } from "../utils/caches";
import { decimalScaleValue } from "../utils/convertToFixedPointDecimals";
import { convertUUIDToBytes16 } from "../utils/convertUUID";

export const capTable = Router();

capTable.get("/", async (req, res) => {
    res.send("Hello Cap Table!");
});

capTable.get("/latest", async (req, res) => {
    /* 
    TODO: handle this in the polling process? or maybe just cache it once in a while?
     It will get slow once we have 50+ stakeholders
    */
    const issuerId = req.query.issuerId;
    try {
        const stakeholders = await Stakeholder.find({issuer: issuerId});
        const stockClasses = await StockClass.find({issuer: issuerId});
        const issuer = await Issuer.findById(issuerId);
        // Grouping by stakeholder_id and stock_class_id, grab the records with the largest createdAt time
        const issuances = await StockIssuance.aggregate([
            {
                $group: {
                    _id: {
                        stakeholder_id: "$stakeholder_id",
                        stock_class_id: "$stock_class_id"
                    },
                    maxDate: { $max: "$createdAt" }
                }
            },
            {
                $lookup: {
                    from: "stockissuances",
                    let: { stakeholder_id: "$_id.stakeholder_id", stock_class_id: "$_id.stock_class_id", maxDate: "$maxDate" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$stakeholder_id", "$$stakeholder_id"] },
                                        { $eq: ["$stock_class_id", "$$stock_class_id"] },
                                        { $eq: ["$createdAt", "$$maxDate"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "issuanceData"
                }
            },
            { $unwind: "$issuanceData" },
            { $replaceRoot: { newRoot: "$issuanceData" } }
        ]);
      
        // We need to hit web3 to see which are actually valid
        const { contract } = await getIssuerContract(issuer);
        let holdings = [];
        const stakeholderMap = Object.fromEntries(stakeholders.map((x) => { return [x._id, x]; }));
        const stockClassMap = Object.fromEntries(stockClasses.map((x) => { return [x._id, x]; }));
        for (const issuance of issuances) {
            const { stakeholder_id, security_id, stock_class_id } = issuance;
            const [_, quantity, sharePrice, timestamp] = await contract.getActivePosition(
                convertUUIDToBytes16(stakeholder_id),
                convertUUIDToBytes16(security_id),
            );
            if (quantity == 0) {
                continue;
            }
            holdings.push({
                issuance,
                stockClass: stockClassMap[stock_class_id],
                stakeholder: stakeholderMap[stakeholder_id],
                quantity: Number(quantity) / decimalScaleValue,
                sharePrice: Number(sharePrice) / decimalScaleValue,
                timestamp: Number(timestamp) * 1000,
            });
        }
        res.send({ holdings, stockClasses, issuer });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
})
