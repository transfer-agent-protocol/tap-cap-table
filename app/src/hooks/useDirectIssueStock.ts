import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useWriteCapTableIssueStock } from "../generated";
import { generateBytes16Id, uuidToBytes16 } from "../utils/uuid";

/** Minimal but valid params for direct onchain issuance (matches what the backend does) */
interface DirectIssueStockParams {
  capTableAddress: `0x${string}`;
  stakeholderId: string;      // UUID
  stockClassId: string;       // UUID
  quantity: string;           // human, e.g. "100000"
  sharePriceAmount: string;   // e.g. "4.20"
  customId?: string;
  comments?: string[];
}

export function useDirectIssueStock() {
  const { address: connectedAddress } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteCapTableIssueStock();

  const issueStock = useCallback(
    async (params: DirectIssueStockParams) => {
      if (!connectedAddress) {
        throw new Error("Please connect your wallet");
      }
      if (!params.capTableAddress) {
        throw new Error("Cap table address is required");
      }

      const issuanceId = generateBytes16Id();
      const securityId = generateBytes16Id();

      // uuidToBytes16 accepts UUID-with-dashes OR an already-0x bytes16 string, so we never
      // end up with double 0x prefixes when the caller passes either form.
      const stakeholderIdBytes = uuidToBytes16(params.stakeholderId);
      const stockClassIdBytes = uuidToBytes16(params.stockClassId);
      const zeroId = `0x${"0".repeat(32)}` as `0x${string}`;

      // Scale price and quantity (1e10 fixed point, matching the rest of the system).
      // The legacy server path applies toScaledBigNumber (= * 1e10) to both, and the poller
      // unscales by 1e10 when persisting to Mongo. We mirror that here so quantities round-trip.
      const scaledPrice = scaleAmount(params.sharePriceAmount);
      const scaledQuantity = scaleAmount(params.quantity);

      // Build the minimal valid StockIssuanceParams struct
      const issuanceParams = {
        stock_class_id: stockClassIdBytes,
        stock_plan_id: zeroId,
        share_numbers_issued: {
          starting_share_number: 0n,
          ending_share_number: 0n,
        },
        share_price: scaledPrice,
        quantity: scaledQuantity,
        vesting_terms_id: zeroId,
        cost_basis: 0n,
        stock_legend_ids: [] as `0x${string}`[],
        issuance_type: "",
        comments: params.comments || [],
        custom_id: params.customId || "",
        stakeholder_id: stakeholderIdBytes,
        board_approval_date: "",
        stockholder_approval_date: "",
        consideration_text: "",
        security_law_exemptions: [] as string[],
      };

      writeContract({
        address: params.capTableAddress,
        args: [issuanceParams],
      });

      // Note: We intentionally do not return `hash` from the action (it would be stale).
      // Consumers should read `hash` from the hook return value after calling `issueStock`.
      return { issuanceId, securityId };
    },
    [writeContract, connectedAddress]
  );

  return {
    issueStock,
    hash,
    isWritePending,
    writeError,
    reset,
    isConnected: !!connectedAddress,
  };
}

/** 1e10 scaling helper (same as used elsewhere) */
function scaleAmount(amount: string): bigint {
  const SCALE = 10_000_000_000n;
  const value = parseFloat(amount);
  if (isNaN(value)) throw new Error("Invalid price amount");
  return BigInt(Math.round(value * Number(SCALE)));
}

