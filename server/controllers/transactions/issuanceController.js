import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

/**
 * Stock issuance controller - the most complex transaction type.
 * Validates required fields via helper, converts all IDs to bytes16,
 * scales quantity, price, cost basis, and share numbers, assembles full StockIssuanceParams struct,
 * and calls contract.issueStock().
 * Used by POST /transactions/issuance/stock.
 */

// StockIssuanceParams holds one share-number range, scaled 1e10 like quantity and price (the
// poller unscales it). The route answers 400 for more than one; this guard stops other callers
// from silently losing ranges.
const toOnchainShareNumbers = (ranges = []) => {
    if (ranges.length > 1) {
        throw new Error(`share_numbers_issued: the onchain issuance holds one range, got ${ranges.length}`);
    }
    const [range] = ranges;
    return {
        starting_share_number: range ? toScaledBigNumber(range.starting_share_number) : 0n,
        ending_share_number: range ? toScaledBigNumber(range.ending_share_number) : 0n,
    };
};

const checkIssuanceValues = (issuance) => {
    return {
        stakeholder_id: issuance.stakeholder_id, // required
        stock_class_id: issuance.stock_class_id, // required
        share_numbers_issued: toOnchainShareNumbers(issuance.share_numbers_issued),
        quantity: issuance.quantity, // required
        share_price: issuance.share_price, // required
        stock_plan_id: issuance.stock_plan_id || "00000000-0000-0000-0000-000000000000",
        vesting_terms_id: issuance.vesting_terms_id || "00000000-0000-0000-0000-000000000000",
        // OCF Monetary; onchain keeps only the scaled amount (the poller labels it with the share price currency)
        cost_basis: issuance.cost_basis ? toScaledBigNumber(issuance.cost_basis.amount) : 0n,
        stock_legend_ids: issuance.stock_legend_ids || [],
        issuance_type: issuance.issuance_type || "",
        comments: issuance.comments || [],
        custom_id: issuance.custom_id || "",
        board_approval_date: issuance.board_approval_date || "",
        stockholder_approval_date: issuance.stockholder_approval_date || "",
        consideration_text: issuance.consideration_text || "",
        // OCF exemption objects ride in the struct's string[] as JSON; handleStockIssuance parses them back
        security_law_exemptions: (issuance.security_law_exemptions || []).map((exemption) =>
            typeof exemption === "string" ? exemption : JSON.stringify(exemption)
        ),
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
        issuance_type,
        comments,
        custom_id,
        board_approval_date,
        stockholder_approval_date,
        consideration_text,
        security_law_exemptions,
    } = checkedValues;

    let StockLegendIdsBytes16 = [];
    for (const legendId of stock_legend_ids) {
        const legendIdBytes16 = convertUUIDToBytes16(legendId);
        StockLegendIdsBytes16.push(legendIdBytes16);
    }

    // Second: create issuance onchain
    const tx = await contract.issueStock({
        stock_class_id: convertUUIDToBytes16(stock_class_id),
        stock_plan_id: convertUUIDToBytes16(stock_plan_id),
        share_numbers_issued,
        share_price: toScaledBigNumber(share_price.amount),
        quantity: toScaledBigNumber(quantity),
        vesting_terms_id: convertUUIDToBytes16(vesting_terms_id),
        cost_basis,
        stock_legend_ids: StockLegendIdsBytes16,
        issuance_type,
        comments,
        custom_id,
        stakeholder_id: convertUUIDToBytes16(stakeholder_id),
        board_approval_date,
        stockholder_approval_date,
        consideration_text,
        security_law_exemptions,
    });
    await tx.wait();
    console.log("✅ | Issued stock onchain, unconfirmed: ", issuance);
};
