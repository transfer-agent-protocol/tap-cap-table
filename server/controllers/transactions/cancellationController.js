import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateCancellationStockOnchain = async (
    contract,
    { stakeholderId, stockClassId, quantity, security_id, reason_text, comments = [] }
) => {
    const scaledQuantity = toScaledBigNumber(quantity);
    const tx = await contract.cancelStock(
        {
            stakeholder_id: convertUUIDToBytes16(stakeholderId),
            stock_class_id: convertUUIDToBytes16(stockClassId),
            security_id: convertUUIDToBytes16(security_id),
            comments,
            reason_text,
        },
        scaledQuantity
    );
    await tx.wait();

    console.log(`✅ | Cancellation Completed: quantity affected: ${quantity}`);
};
