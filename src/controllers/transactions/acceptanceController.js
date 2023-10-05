import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateAcceptanceStockOnchain = async (
    contract,
    { stakeholderId,
        stockClassId,
        security_id,
        comments = [] }
) => {
    const secIdBytes16 = convertUUIDToBytes16(security_id);
    const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const tx = await contract.acceptStock(
        stakeHolderIdBytes16,
        stockClassIdBytes16,
        secIdBytes16,
        comments,
    );
    await tx.wait();
};
