import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateCancallationStockOnchain = async (
    contract,
    {
        stakeholderId,
        stockClassId,
        quantity,
        security_id,
        reason_text,
        comments = [],
    }
) => {

    const secIdBytes16 = convertUUIDToBytes16(security_id);
    const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);
    const quantityScaled = toScaledBigNumber(quantity);

    const tx = await contract.cancelStock(
        stakeHolderIdBytes16,
        stockClassIdBytes16,
        secIdBytes16,
        comments,
        reason_text,
        quantityScaled
    );
    await tx.wait();

    console.log(`Cancellation Completed: quantity affected: ${quantity}`);
};

