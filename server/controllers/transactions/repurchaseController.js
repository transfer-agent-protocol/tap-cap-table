import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

/**
 * Repurchase controller.
 * Converts IDs, scales price and quantity, then calls contract.repurchaseStock().
 * StockParams has no consideration_text, so the OCF field rides in reason_text and the
 * contract copies it into StockRepurchase.consideration_text.
 */

export const convertAndCreateRepurchaseStockOnchain = async (
    contract,
    { stakeholderId, stockClassId, security_id, consideration_text = "", quantity, price, comments = [] }
) => {
    const scaledPrice = toScaledBigNumber(price.amount);
    const scaledQuantity = toScaledBigNumber(quantity);

    const tx = await contract.repurchaseStock(
        {
            stakeholder_id: convertUUIDToBytes16(stakeholderId),
            stock_class_id: convertUUIDToBytes16(stockClassId),
            security_id: convertUUIDToBytes16(security_id),
            comments,
            reason_text: consideration_text,
        },
        scaledQuantity,
        scaledPrice
    );
    await tx.wait();
};
