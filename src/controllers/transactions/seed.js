import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";

// TODO: date is missing onchain, we need a deeper dive into a fix
export const convertAndSeedTransferStockOnchain = async (contract, transfer) => {
    const {
        id,
        quantity,
        security_id,
        date = "",
        consideration_text = "",
        balance_security_id = "00000000-0000-0000-0000-000000000000",
        resulting_security_ids,
        comments = [],
    } = transfer;

    if (!id || !security_id || !quantity || resulting_security_ids.length === 0) throw Error("Missing transfer data");

    const idBytes16 = convertUUIDToBytes16(id);
    const securityidBytes16 = convertUUIDToBytes16(security_id);
    const quantityScaled = toScaledBigNumber(quantity);

    const balanceSecurityId16 = convertUUIDToBytes16(balance_security_id);

    const resultingSecurityIdsBytes16 = resulting_security_ids.map((resultingSecurityId) => convertUUIDToBytes16(resultingSecurityId));

    const tx = await contract.transferStockFromSeed(
        idBytes16,
        securityidBytes16,
        resultingSecurityIdsBytes16,
        balanceSecurityId16,
        quantityScaled,
        comments,
        consideration_text
    );

    await tx.wait();
    console.log("Transferred stock onchain, unconfirmed: ", transfer);
};

export const convertAndSeedIssuanceStockOnchain = async (contract, issuance) => {
    const {
        id,
        security_id,
        stakeholder_id = "",
        stock_class_id = "",
        share_numbers_issued = ["0", "0"],
        quantity = 0,
        share_price = { amount: 0 },
        stock_plan_id = "00000000-0000-0000-0000-000000000000",
        vesting_terms_id = "00000000-0000-0000-0000-000000000000",
        cost_basis = { amount: 0 },
        stock_legend_ids = [],
        issuance_type = "",
        comments = [],
        custom_id = "",
        board_approval_date = "",
        stockholder_approval_date = "",
        consideration_text = "",
        security_law_exemptions = [],
    } = issuance;

    if (!id || !security_id) throw Error("missing property id or security id");

    // Convert OCF Types to Onchain Types
    const idBytes16 = convertUUIDToBytes16(id);
    const securityidBytes16 = convertUUIDToBytes16(security_id);
    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholder_id);
    const stockClassIdBytes16 = convertUUIDToBytes16(stock_class_id);
    const vestingTermsBytes16 = convertUUIDToBytes16(vesting_terms_id);
    const stockPlanIdBytes16 = convertUUIDToBytes16(stock_plan_id);
    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(share_price.amount);
    const costBasisScaled = toScaledBigNumber(cost_basis.amount);
    const shareNumbersIssuedScaled = {
        starting_share_number: toScaledBigNumber(0),
        ending_share_number: toScaledBigNumber(0),
    };

    const stockLegendIdsBytes16 = stock_legend_ids.map((legendId) => convertUUIDToBytes16(legendId));

    // Create issuance onchain
    const tx = await contract.issueStockFromSeed(
        idBytes16,
        securityidBytes16,
        stockClassIdBytes16,
        stockPlanIdBytes16,
        shareNumbersIssuedScaled,
        sharePriceScaled,
        quantityScaled,
        vestingTermsBytes16,
        costBasisScaled,
        stockLegendIdsBytes16,
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
