import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";

export const convertAndCreateRepurchaseStockOnchain = async (
    contract,
    { stakeholderId,
        stockClassId,
        security_id,
        considertationText,
        quantity,
        price,
        comments = [] }
) => {
    const secIdBytes16 = convertUUIDToBytes16(security_id);
    const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const tx = await contract.repurchaseStock(stakeHolderIdBytes16, stockClassIdBytes16, secIdBytes16, comments, considertationText, quantity, price);
    await tx.wait();
};
