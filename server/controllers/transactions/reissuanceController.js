import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";

/**
 * Reissuance controller.
 * Converts IDs (including array of resulting security IDs) to bytes16
 * and calls contract.reissueStock() with retraction params + new IDs.
 */

export const convertAndCreateReissuanceStockOnchain = async (
    contract,
    { stakeholderId, stockClassId, resulting_security_ids, security_id, reason_text, comments = [] }
) => {
    const resulting_security_ids_b16 = resulting_security_ids.map((sId) => convertUUIDToBytes16(sId));
    const tx = await contract.reissueStock(
        {
            stakeholder_id: convertUUIDToBytes16(stakeholderId),
            stock_class_id: convertUUIDToBytes16(stockClassId),
            security_id: convertUUIDToBytes16(security_id),
            comments,
            reason_text,
        },
        resulting_security_ids_b16
    );
    await tx.wait();
};
