import { useCallback } from "react";
import { scaleAmount, scaleShares } from "@tap/units";
import { useWriteCapTableTransferStock } from "../generated";
import { useOnchainAction } from "./useOnchainAction";
import { uuidToBytes16 } from "../utils/uuid";

export interface DirectTransferStockParams {
	capTableAddress: `0x${string}`;
	transferorId: string; // UUID from
	transfereeId: string; // UUID to
	stockClassId: string; // UUID
	quantity: string; // human shares
	sharePriceAmount: string; // e.g. "0" or last price
	customId?: string;
	/** Buyer accredited / verified — defaults true for admin transfers */
	isBuyerVerified?: boolean;
}

/**
 * Direct-wallet stock transfer (capTable.transferStock).
 * Mirrors server convertAndCreateTransferStockOnchain scaling.
 */
export function useDirectTransferStock() {
	const write = useWriteCapTableTransferStock();
	const action = useOnchainAction(write);

	const transferStock = useCallback(
		async (params: DirectTransferStockParams) => {
			if (!action.isConnected) {
				throw new Error("Please connect your wallet");
			}
			if (!params.capTableAddress) {
				throw new Error("Cap table address is required");
			}
			if (params.transferorId === params.transfereeId) {
				throw new Error("From and to must be different shareholders");
			}

			const quantity = scaleShares(params.quantity);
			const sharePrice = scaleAmount(params.sharePriceAmount || "0");

			const transferParams = {
				transferor_stakeholder_id: uuidToBytes16(params.transferorId),
				transferee_stakeholder_id: uuidToBytes16(params.transfereeId),
				stock_class_id: uuidToBytes16(params.stockClassId),
				is_buyer_verified: params.isBuyerVerified !== false,
				quantity,
				share_price: sharePrice,
				nonce: 0n,
				custom_id: params.customId || "",
			};

			const writeAsync = write.writeContractAsync ?? write.writeContract;
			const hash = await writeAsync({
				address: params.capTableAddress,
				args: [transferParams],
			});

			return { hash: typeof hash === "string" ? hash : undefined };
		},
		[write, action.isConnected],
	);

	return {
		transferStock,
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
