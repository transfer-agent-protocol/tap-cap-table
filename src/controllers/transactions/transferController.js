import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateTransferStockOnchain = async (contract, transfer) => {
    const { quantity, transferorId, transfereeId, stockClassId, isBuyerVerified, sharePrice } = transfer;

    // First: convert OCF Types to Onchain Types
    const transferorIdBytes16 = convertUUIDToBytes16(transferorId);
    const transfereeIdBytes16 = convertUUIDToBytes16(transfereeId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(sharePrice);
    const tx = await contract.transferStock({
        transferor_stakeholder_id: transferorIdBytes16,
        transferee_stakeholder_id: transfereeIdBytes16,
        stock_class_id: stockClassIdBytes16,
        is_buyer_verified: isBuyerVerified,
        quantity: quantityScaled,
        share_price: sharePriceScaled,
        nonce: 0,
        custom_id: "",
    });
    await tx.wait();
    console.log(`Initiate Stock Transfer from transferee ID: ${transfereeId} to transferor ID: ${transferorId}`);
    console.log(`Quantity to be transferred: ${quantity}`);
    console.log(`Price per share: ${sharePrice}`);
};
