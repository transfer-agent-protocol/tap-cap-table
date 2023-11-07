import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";

export const convertAndCreateRetractionStockOnchain = async (
    contract,
    { stakeholderId,
        stockClassId,
        security_id,
        reason_text,
        comments = [] }
) => {

    const tx = await contract.retractStockIssuance({
        stakeholder_id: convertUUIDToBytes16(stakeholderId),
        stock_class_id: convertUUIDToBytes16(stockClassId),
        security_id: convertUUIDToBytes16(security_id),
        comments,
        reason_text
    });
    await tx.wait();
};
