import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";

/**
 * Retraction controller.
 * Converts IDs to bytes16 and calls contract.retractStockIssuance().
 * No scaling required for this operation.
 */

export const convertAndCreateRetractionStockOnchain = async (contract, { stakeholderId, stockClassId, security_id, reason_text, comments = [] }) => {
    const tx = await contract.retractStockIssuance({
        stakeholder_id: convertUUIDToBytes16(stakeholderId),
        stock_class_id: convertUUIDToBytes16(stockClassId),
        security_id: convertUUIDToBytes16(security_id),
        comments,
        reason_text,
    });
    await tx.wait();
};
