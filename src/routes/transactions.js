import { Router } from "express";
import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID.js";
import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";
import { convertAndCreateIssuanceStockOnchain } from "../db/controllers/transactions/issuanceController.js";

const transactions = Router();

transactions.post("/issuance/stock", async (req, res) => {
    const { contract } = req;

    try {
        await convertAndCreateIssuanceStockOnchain(contract, req.body);

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

        console.log(`Transfer completed from transferee ID: ${transfereeId} to transferor ID: ${transferorId}`);
        console.log(`Quantity transferred: ${quantity}`);
        console.log(`Price per share: ${sharePrice}`);

        res.status(200).send("success");
    } catch (err) {
        console.error("Error encountered for transferring stock", err.error.reason);
        res.status(400).send(err.error.reason);
    }
});

export default transactions;
