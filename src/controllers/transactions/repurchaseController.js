import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateRepurchaseStockOnchain = async (
    contract,
    { stakeholderId,
        stockClassId,
        security_id,
        considertationText= "",
        quantity,
        price,
        comments = [] }
) => {
    const secIdBytes16 = convertUUIDToBytes16(security_id);
    const stakeHolderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);
    const scaledQuantity = toScaledBigNumber(quantity)
    const scaledPrice =  toScaledBigNumber(price.amount)

    const tx = await contract.repurchaseStock(
        stakeHolderIdBytes16,
        stockClassIdBytes16,
        secIdBytes16,
        comments,
        considertationText,
        scaledQuantity,
        scaledPrice
    );
    await tx.wait();
};
