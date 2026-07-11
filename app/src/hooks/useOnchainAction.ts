import { useCallback, useMemo } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";

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
	// Align with AppKit connect state so manage actions aren't blocked when the
	// top-bar wallet shows connected but wagmi briefly lags.
	const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
	const { address: appKitAddress, isConnected: appKitConnected } = useAppKitAccount();
	const connectedAddress = (wagmiAddress || appKitAddress) as `0x${string}` | undefined;
	const isConnected = Boolean((wagmiConnected || appKitConnected) && connectedAddress);
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
		address: connectedAddress,
	};
}

