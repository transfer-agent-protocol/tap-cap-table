import { Router } from "express";
import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID.js";
import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";

const transactions = Router();

transactions.post("/issuance/stock", async (req, res) => {
    const { contract } = req;
    const {
        stakeholderId,
        stockClassId,
        quantity,
        sharePrice,
        stockPlanId,
        shareNumbersIssued,
        vestingTermsId,
        costBasis,
        stockLegendIds,
        issuanceType,
        comments,
        customId,
        boardApprovalDate,
        stockholderApprovalDate,
        considerationText,
        securityLawExemptions,
    } = req.body;

    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);
    const vestingTermsBytes16 = convertUUIDToBytes16(vestingTermsId);
    const stockPlanIdBytes16 = convertUUIDToBytes16(stockPlanId);

    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(sharePrice);

    try {
        const tx = await contract.issueStockByTA(
            stockClassIdBytes16,
            stockPlanIdBytes16,
            shareNumbersIssued, // not converted
            sharePriceScaled,
            quantityScaled,
            vestingTermsBytes16,
            costBasis, // not converted
            stockLegendIds, // not converted
            issuanceType,
            comments,
            customId,
            stakeholderIdBytes16,
            boardApprovalDate,
            stockholderApprovalDate,
            considerationText,
            securityLawExemptions
        );
        await tx.wait();
        console.log("Issued stock successfully");

        res.status(200).send("success");
    } catch (error) {
        console.error("Error encountered for issuing stock", error);
    }
});

// WIP, not working yet
transactions.post("/transfer/stock", async (req, res) => {
    const { contract } = req;
    const { quantity, transferorId, transfereeId, stockClassId, isBuyerVerified, sharePrice } = req.body;

    const transferorIdBytes16 = convertUUIDToBytes16(transferorId);
    const transfereeIdBytes16 = convertUUIDToBytes16(transfereeId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(sharePrice);

    try {
        const tx = await contract.transferStockOwnership(
            transferorIdBytes16,
            transfereeIdBytes16,
            stockClassIdBytes16,
            isBuyerVerified,
            quantityScaled,
            sharePriceScaled
        );
        await tx.wait();
        console.log("Transferred stock successfully");
        res.status(200).send("success");
    } catch (err) {
        console.error("Error encountered for transferring stock", err.error.reason);
        res.status(400).send(err.error.reason);
    }
});

export default transactions;
