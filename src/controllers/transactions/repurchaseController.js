import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateRepurchaseStockOnchain = async (
    contract,
    { stakeholderId,
        stockClassId,
        security_id,
        considertationText = "",
        quantity,
        price,
        comments = [] }
) => {
    const scaledPrice = toScaledBigNumber(price.amount)

    const tx = await contract.repurchaseStock({
        stakeholder_id: convertUUIDToBytes16(stakeholderId),
        stock_class_id: convertUUIDToBytes16(stockClassId),
        security_id: convertUUIDToBytes16(security_id),
        quantity: toScaledBigNumber(quantity),
        comments,
        nonce: 0, // needed because of StockParamsQuantity Struct
        reason_text: considertationText // there is no consideration text in StockParamsQuantity Struct
        // consideration_text: considertationText
    }, scaledPrice);
    await tx.wait();
};
