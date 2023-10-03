import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";

export const convertAndAdjustIssuerAuthorizedSharesOnChain = async (contract, data) => {

    const tx = await contract.adjustIssuerAuthorizedShares(
        toScaledBigNumber(data.newAutorizedShares),
        data.comments,
        data.boardApprovalDate,
        data.stockholderApprovalDate
    );
    await tx.wait();
}

