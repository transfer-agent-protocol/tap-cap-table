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
    const secIdBytes16 = convertUUIDToBytes16(security_id);
    const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);
    const resultingSecIds  = resulting_security_ids.map( sId => convertUUIDToBytes16(sId))

    const tx = await contract.reissueStock(stakeHolderIdBytes16, stockClassIdBytes16, resultingSecIds, secIdBytes16, comments, reason_text);
    await tx.wait();
};
