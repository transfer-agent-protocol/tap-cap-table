import { convertUUIDToBytes16 } from "../../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../../utils/convertToFixedPointDecimals.js";

export const convertAndCreateIssuanceStockOnchain = async (contract, issuance) => {
    const {
        stakeholderId,
        stockClassId,
        quantity,
        sharePrice,
        stockPlanId,
        shareNumbersIssued,
        vestingTermsId,
        costBasis,
        stockLegendIds,
        issuanceType,
        comments,
        customId,
        boardApprovalDate,
        stockholderApprovalDate,
        considerationText,
        securityLawExemptions,
    } = issuance;

    // First: convert OCF Types to Onchain Types
    const stakeholderIdBytes16 = convertUUIDToBytes16(stakeholderId);
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClassId);
    const vestingTermsBytes16 = convertUUIDToBytes16(vestingTermsId);
    const stockPlanIdBytes16 = convertUUIDToBytes16(stockPlanId);
    const quantityScaled = toScaledBigNumber(quantity);
    const sharePriceScaled = toScaledBigNumber(sharePrice);

    // Second: create issuance onchain
    const tx = await contract.issueStockByTA(
        stockClassIdBytes16,
        stockPlanIdBytes16,
        shareNumbersIssued, // not converted
        sharePriceScaled,
        quantityScaled,
        vestingTermsBytes16,
        costBasis, // not converted
        stockLegendIds, // not converted
        issuanceType,
        comments,
        customId,
        stakeholderIdBytes16,
        boardApprovalDate,
        stockholderApprovalDate,
        considerationText,
        securityLawExemptions
    );
    await tx.wait();
    console.log("Issued stock successfully");
};
