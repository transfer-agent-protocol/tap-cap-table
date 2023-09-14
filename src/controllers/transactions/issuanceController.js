import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

const checkIssuanceValues = (issuance) => {
    return {
        stakeholder_id: issuance.stakeholder_id, // required
        stock_class_id: issuance.stock_class_id, // required
        share_numbers_issued: issuance.share_numbers_issued || [0, 0],
        quantity: issuance.quantity, // required
        share_price: issuance.share_price, // required
        stock_plan_id: issuance.stock_plan_id || "00000000-0000-0000-0000-000000000000",
        vesting_terms_id: issuance.vesting_terms_id || "00000000-0000-0000-0000-000000000000",
        cost_basis: issuance.cost_basis || 0,
        stock_legend_ids: issuance.stock_legend_ids || [],
        issuance_type: issuance.issuance_type || "",
        comments: issuance.comments || [],
        custom_id: issuance.custom_id || "",
        board_approval_date: issuance.board_approval_date || "",
        stockholder_approval_date: issuance.stockholder_approval_date || "",
        consideration_text: issuance.consideration_text || "",
        security_law_exemptions: issuance.security_law_exemptions || [],
    };
};

export const convertAndCreateIssuanceStockOnchain = async (contract, issuance) => {
    const checkedValues = checkIssuanceValues(issuance);
    const {
        stakeholder_id,
        stock_class_id,
        quantity,
        share_price,
        stock_plan_id,
        share_numbers_issued,
        vesting_terms_id,
        cost_basis,
        stock_legend_ids,
        security_id, // TODO: currently only created onchain. Need to create option to create here
        issuance_type,
        comments,
        custom_id,
        board_approval_date,
        stockholder_approval_date,
        consideration_text,
        security_law_exemptions,
    } = checkedValues;

    // First: convert OCF Types to Onchain Types
    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholder_id);
    const stockClassIdBytes16 = convertUUIDToBytes16(stock_class_id);
    const vestingTermsBytes16 = convertUUIDToBytes16(vesting_terms_id);
    const stockPlanIdBytes16 = convertUUIDToBytes16(stock_plan_id);
    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(share_price.amount);

    let StockLegendIdsBytes16 = [];
    for (const legendId of stock_legend_ids) {
        const legendIdBytes16 = convertUUIDToBytes16(legendId);
        StockLegendIdsBytes16.push(legendIdBytes16);
    }

    // Second: create issuance onchain
    const tx = await contract.issueStockByTA(
        stockClassIdBytes16,
        stockPlanIdBytes16,
        share_numbers_issued, // not converted
        sharePriceScaled,
        quantityScaled,
        vestingTermsBytes16,
        cost_basis, // not converted
        StockLegendIdsBytes16,
        issuance_type,
        comments,
        custom_id,
        stakeholderIdBytes16,
        board_approval_date,
        stockholder_approval_date,
        consideration_text,
        security_law_exemptions
    );
    await tx.wait();
    console.log("Issued stock onchain, unconfirmed: ", issuance);
};
