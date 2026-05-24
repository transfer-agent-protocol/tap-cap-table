import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

/**
 * Acceptance controller.
 * Converts three IDs to bytes16 (positional arguments) and calls
 * contract.acceptStock(). Simple compared to other transaction controllers.
 */

export const convertAndCreateAcceptanceStockOnchain = async (contract, { stakeholderId, stockClassId, security_id, comments = [] }) => {
    const secIdBytes16 = convertUUIDToBytes16(security_id);
    const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const tx = await contract.acceptStock(stakeHolderIdBytes16, stockClassIdBytes16, secIdBytes16, comments);
    await tx.wait();
};
