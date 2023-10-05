import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";

export const convertAndCreateRetractionStockOnchain = async (
    contract,
    { stakeholderId,
        stockClassId,
        security_id,
        reason_text,
        comments = [] }
) => {
    const secIdBytes16 = convertUUIDToBytes16(security_id);
    const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const tx = await contract.retractStockIssuance(stakeHolderIdBytes16, stockClassIdBytes16, secIdBytes16, comments, reason_text);
    await tx.wait();
};
