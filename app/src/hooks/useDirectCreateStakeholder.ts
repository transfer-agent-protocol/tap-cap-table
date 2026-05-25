import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useWriteCapTableCreateStakeholder } from "../generated";
import { generateBytes16Id } from "../utils/uuid";

interface DirectCreateStakeholderParams {
  capTableAddress: `0x${string}`;
  stakeholderType: "INDIVIDUAL" | "INSTITUTION";
  currentRelationship: string;
}

export function useDirectCreateStakeholder() {
  const { address: connectedAddress } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteCapTableCreateStakeholder();

  const createStakeholder = useCallback(
    async (params: DirectCreateStakeholderParams & { id?: `0x${string}` }) => {
      if (!connectedAddress) {
        throw new Error("Please connect your wallet");
      }
      if (!params.capTableAddress) {
        throw new Error("Cap table address is required");
      }

      // Allow caller to supply the id (so we can use the exact same bytes16 for both the onchain tx
      // and the subsequent offchain metadata record). Otherwise generate one.
      const stakeholderId = params.id || generateBytes16Id();

      writeContract({
        address: params.capTableAddress,
        args: [
          stakeholderId,
          params.stakeholderType,
          params.currentRelationship,
        ],
      });

      // Note: We do NOT return `hash` here. The hash from `useWriteContract` is updated
      // asynchronously. Consumers should use the `hash` value exposed by this hook after
      // calling the action (or better, use `useWaitForTransactionReceipt` for confirmation).
      return { stakeholderId };
    },
    [writeContract, connectedAddress]
  );

  return {
    createStakeholder,
    hash,                    // Current hash from the write (updated after submission)
    isWritePending,
    writeError,
    reset,
    isConnected: !!connectedAddress,
  };
}
