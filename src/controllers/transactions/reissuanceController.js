import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";

export const convertAndCreateReissuanceStockOnchain = async (
    contract,
    { stakeholderId,
        stockClassId,
        resulting_security_ids,
        security_id,
        reason_text,
        comments = [] }
) => {
    const resulting_security_ids_b16 = resulting_security_ids.map(sId => convertUUIDToBytes16(sId)),
    const tx = await contract.reissueStock({
        stakeholder_id: convertUUIDToBytes16(stakeholderId),
        stock_class_id: convertUUIDToBytes16(stockClassId),
        security_id: convertUUIDToBytes16(security_id),
        comments,
        reason_text
    }, resulting_security_ids_b16);
    await tx.wait();
};
