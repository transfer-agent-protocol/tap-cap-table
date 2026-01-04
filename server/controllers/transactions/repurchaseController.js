import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateRepurchaseStockOnchain = async (
    contract,
    { stakeholderId, stockClassId, security_id, considerationText = "", quantity, price, comments = [] }
) => {
    const scaledPrice = toScaledBigNumber(price.amount);
    const scaledQuantity = toScaledBigNumber(quantity);

    const tx = await contract.repurchaseStock(
        {
            stakeholder_id: convertUUIDToBytes16(stakeholderId),
            stock_class_id: convertUUIDToBytes16(stockClassId),
            security_id: convertUUIDToBytes16(security_id),
            comments,
            reason_text: considerationText, // there is no consideration text in StockParams Struct
        },
        scaledQuantity,
        scaledPrice
    );
    await tx.wait();
};
