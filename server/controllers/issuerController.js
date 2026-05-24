import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";

/**
 * Converts OCF data and adjusts the issuer's authorized shares onchain.
 * Scales the new share count before calling the contract.
 * Part of the authorized shares adjustment flow (used via /transactions/adjust/issuer/authorized-shares).
 */

export const convertAndAdjustIssuerAuthorizedSharesOnChain = async (
    contract,
    { new_shares_authorized, board_approval_date = "", stockholder_approval_date = "", comments }
) => {
    const tx = await contract.adjustIssuerAuthorizedShares(
        toScaledBigNumber(new_shares_authorized),
        comments,
        board_approval_date,
        stockholder_approval_date
    );
    await tx.wait();
};
