import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useWriteCapTableCreateStockClass } from "../generated";
import { generateBytes16Id } from "../utils/uuid";

interface DirectCreateStockClassParams {
  capTableAddress: `0x${string}`;
  classType: "COMMON" | "PREFERRED";
  pricePerShareAmount: string; // human readable, e.g. "4.20"
  initialSharesAuthorized: string; // e.g. "1000000"
}

export function useDirectCreateStockClass() {
  const { address: connectedAddress } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteCapTableCreateStockClass();

  const createStockClass = useCallback(
    async (params: DirectCreateStockClassParams & { id?: `0x${string}` }) => {
      if (!connectedAddress) {
        throw new Error("Please connect your wallet");
      }
      if (!params.capTableAddress) {
        throw new Error("Cap table address is required");
      }

      // Generate a fresh bytes16 ID on the client (same pattern as mint flow).
      // Caller can supply one so the same id is used for both the direct onchain tx
      // and the offchain metadata record (prevents duplicate events + poller null races).
      const stockClassId = params.id || generateBytes16Id();

      // Scale the price (protocol uses 1e10 fixed point for prices)
      const scaledPrice = scaleAmount(params.pricePerShareAmount);

      // Shares authorized must ALSO be scaled by 1e10: the issuer's authorized shares, the
      // issuance quantity (useDirectIssueStock), and the poller all use 1e10 fixed point. If we
      // store this unscaled, issueStock compares a scaled quantity against an unscaled authorized
      // and reverts ("StockClass: Insufficient shares authorized"). Shares are whole numbers, so
      // use BigInt math to avoid the float precision loss that scaleAmount() would hit at >2^53.
      const SHARE_SCALE = 10_000_000_000n; // 1e10
      const sharesAuthorized = BigInt(params.initialSharesAuthorized) * SHARE_SCALE;

      writeContract({
        address: params.capTableAddress,
        args: [
          stockClassId,
          params.classType,
          scaledPrice,
          sharesAuthorized,
        ],
      });

      // Note: We intentionally do not return `hash` from the action.
      // See useDirectCreateStakeholder.ts for explanation.
      return { stockClassId };
    },
    [writeContract, connectedAddress]
  );

  return {
    createStockClass,
    hash,
    isWritePending,
    writeError,
    reset,
    isConnected: !!connectedAddress,
  };
}

/** Scales a human decimal amount using the protocol's 1e10 fixed point */
function scaleAmount(amount: string): bigint {
  const SCALE = 10_000_000_000n; // 1e10
  const value = parseFloat(amount);
  if (isNaN(value)) throw new Error("Invalid price amount");
  return BigInt(Math.round(value * Number(SCALE)));
}
