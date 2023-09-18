import { convertUUIDToBytes16 } from "../../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../../utils/convertToFixedPointDecimals.js";

export const convertAndSeedIssuanceStockOnchain = async (contract, issuance) => {
    console.log({ issuance })
    const {
        id,
        security_id,
        stakeholder_id = "",
        stock_class_id = "",
        share_numbers_issued = ['0', '0'],
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

    if (!id || !security_id) throw Error("missing property id or security id")

    // Convert OCF Types to Onchain Types
    const idBytes16 = convertUUIDToBytes16(id);
    const securityidBytes16 = convertUUIDToBytes16(security_id);
    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholder_id);
    const stockClassIdBytes16 = convertUUIDToBytes16(stock_class_id);
    const vestingTermsBytes16 = convertUUIDToBytes16(vesting_terms_id);
    const stockPlanIdBytes16 = convertUUIDToBytes16(stock_plan_id);
    console.log({ quantity, share_price, cost_basis })
    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(share_price.amount);
    const costBasisScaled = toScaledBigNumber(cost_basis.amount);
    console.log({ share_numbers_issued })
    const shareNumbersIssuedScaled = {
        starting_share_number: toScaledBigNumber(0),
        ending_share_number: toScaledBigNumber(0),
    };
    console.log('here')

    const stockLegendIdsBytes16 = stock_legend_ids.map(legendId => convertUUIDToBytes16(legendId));

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

export const convertAndSeedTransferStockOnchain = async (contract, transfer) => {
    const {
        id,
        transferorId,
        transferorStockId,
        transferorSecId,
        transfereeId,
        transfereeStockId,
        transfereeSecId,
        quantity,
        stockClassId,
        isBuyerVerified,
        sharePrice,
        balanceStockId = "00000000-0000-0000-0000-000000000000",
        balanceSecId = "00000000-0000-0000-0000-000000000000",
    } = transfer;
    console.log('inside')
    console.log({ transfer })

    // First: convert OCF Types to Onchain Types
    const idBytes16 = convertUUIDToBytes16(id)
    const transferorIdBytes16 = convertUUIDToBytes16(transferorId);
    const transferorStockIdBytes16 = convertUUIDToBytes16(transferorStockId);
    const transferorSecIdBytes16 = convertUUIDToBytes16(transferorSecId);

    const transfereeIdBytes16 = convertUUIDToBytes16(transfereeId);
    const transfereeStockIdBytes16 = convertUUIDToBytes16(transfereeStockId);
    const transfereeSecIdBytes16 = convertUUIDToBytes16(transfereeSecId);

    const balanceStockIdBytes16 = convertUUIDToBytes16(balanceStockId);
    const balanceSecIdBytes16 = convertUUIDToBytes16(balanceSecId);

    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);

    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(sharePrice);

    const tx = await contract.transferStockOwnershipFromSeed(
        idBytes16,
        transferorIdBytes16,
        transfereeIdBytes16,
        transferorSecIdBytes16,
        transfereeStockIdBytes16,
        transfereeSecIdBytes16,
        stockClassIdBytes16,
        isBuyerVerified,
        quantityScaled,
        sharePriceScaled,
        balanceStockIdBytes16,
        balanceSecIdBytes16
    );
    await tx.wait();

    console.log(`Transfer completed from transferee ID: ${transfereeId} to transferor ID: ${transferorId}`);
    console.log(`Quantity transferred: ${quantity}`);
    console.log(`Price per share: ${sharePrice}`);
};
