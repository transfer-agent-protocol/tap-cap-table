import { useCallback, useMemo } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";

/**
 * Shared lifecycle for direct-wallet writes:
 * write → wait for receipt → success | reverted | failed.
 * Never treat "submitted" as success.
 */
export type OnchainActionStatus = "idle" | "writing" | "confirming" | "success" | "reverted" | "error";

export interface OnchainActionState {
	status: OnchainActionStatus;
	hash: `0x${string}` | undefined;
	isWritePending: boolean;
	isConfirming: boolean;
	isConfirmed: boolean;
	isReverted: boolean;
	writeError: Error | null;
	/** Human message for UI (write error or generic revert). */
	errorMessage: string | null;
	reset: () => void;
	isConnected: boolean;
	address: `0x${string}` | undefined;
}

type WriteContractLike = {
	writeContract: (...args: any[]) => void;
	writeContractAsync?: (...args: any[]) => Promise<`0x${string}`>;
	data: `0x${string}` | undefined;
	isPending: boolean;
	error: Error | null;
	reset: () => void;
};

/**
 * Normalize a wagmi write-contract hook into a single receipt-aware action state.
 * Pass the object returned by generated `useWriteCapTable*` hooks.
 */
export function useOnchainAction(write: WriteContractLike): OnchainActionState {
	const { address: connectedAddress, isConnected: accountConnected } = useAccount();
	const isConnected = Boolean(accountConnected && connectedAddress);
	const hash = write.data;
	const { data: receipt, isSuccess: receiptFetched } = useWaitForTransactionReceipt({ hash });
	const isConfirmed = receiptFetched && receipt?.status === "success";
	const isReverted = receiptFetched && receipt?.status === "reverted";
	const isConfirming = !!hash && !receiptFetched;

	const status: OnchainActionStatus = useMemo(() => {
		if (write.error) return "error";
		if (isReverted) return "reverted";
		if (isConfirmed) return "success";
		if (isConfirming) return "confirming";
		if (write.isPending) return "writing";
		return "idle";
	}, [write.error, write.isPending, isConfirming, isConfirmed, isReverted]);

	const errorMessage = useMemo(() => {
		if (write.error) return write.error.message;
		if (isReverted) {
			return "Transaction was mined but reverted on-chain. Nothing was applied.";
		}
		return null;
	}, [write.error, isReverted]);

	const reset = useCallback(() => write.reset(), [write]);

	return {
		status,
		hash,
		isWritePending: write.isPending,
		isConfirming,
		isConfirmed: !!isConfirmed,
		isReverted: !!isReverted,
		writeError: write.error,
		errorMessage,
		reset,
		isConnected,
		address: connectedAddress as `0x${string}` | undefined,
	};
}

