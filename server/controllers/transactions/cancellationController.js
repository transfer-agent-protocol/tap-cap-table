import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

/**
 * Cancellation controller.
 * Converts IDs to bytes16, scales quantity, and calls contract.cancelStock()
 * with a params struct + separate quantity argument.
 * Supports partial cancellation.
 */

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
