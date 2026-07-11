import { useCallback } from "react";
import { scaleAmount, scaleShares, generateBytes16Id } from "@tap/units";
import { useWriteCapTableCreateStockClass } from "../generated";
import { useOnchainAction } from "./useOnchainAction";

interface DirectCreateStockClassParams {
	capTableAddress: `0x${string}`;
	classType: "COMMON" | "PREFERRED";
	pricePerShareAmount: string; // human readable, e.g. "4.20"
	initialSharesAuthorized: string; // e.g. "1000000"
}

export function useDirectCreateStockClass() {
	const write = useWriteCapTableCreateStockClass();
	const action = useOnchainAction(write);

	const createStockClass = useCallback(
		async (params: DirectCreateStockClassParams & { id?: `0x${string}` }) => {
			if (!action.isConnected) {
				throw new Error("Please connect your wallet");
			}
			if (!params.capTableAddress) {
				throw new Error("Cap table address is required");
			}

			// Caller can supply id so the same bytes16 is used onchain + offchain metadata.
			const stockClassId = params.id || generateBytes16Id();

			const scaledPrice = scaleAmount(params.pricePerShareAmount);
			// Shares authorized must be scaled by 1e10 (same as issuer + issuance quantity).
			const sharesAuthorized = scaleShares(params.initialSharesAuthorized);

			write.writeContract({
				address: params.capTableAddress,
				args: [stockClassId, params.classType, scaledPrice, sharesAuthorized],
			});

			return { stockClassId };
		},
		[write, action.isConnected],
	);

	return {
		createStockClass,
		hash: action.hash,
		isWritePending: action.isWritePending,
		isConfirming: action.isConfirming,
		isConfirmed: action.isConfirmed,
		isReverted: action.isReverted,
		status: action.status,
		writeError: action.writeError,
		errorMessage: action.errorMessage,
		reset: action.reset,
		isConnected: action.isConnected,
	};
}
