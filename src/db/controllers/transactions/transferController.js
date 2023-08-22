import { convertUUIDToBytes16 } from "../../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateTransferStockOnchain = async (contract, transfer) => {
    const { quantity, transferorId, transfereeId, stockClassId, isBuyerVerified, sharePrice } = transfer;

    // First: convert OCF Types to Onchain Types
    const transferorIdBytes16 = convertUUIDToBytes16(transferorId);
    const transfereeIdBytes16 = convertUUIDToBytes16(transfereeId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(sharePrice);

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
};
