import { useCallback } from "react";
import { scaleAmount, scaleShares, generateBytes16Id } from "@tap/units";
import { useWriteCapTableIssueStock } from "../generated";
import { useOnchainAction } from "./useOnchainAction";
import { uuidToBytes16 } from "../utils/uuid";

/** Minimal but valid params for direct onchain issuance (matches what the backend does) */
interface DirectIssueStockParams {
	capTableAddress: `0x${string}`;
	stakeholderId: string; // UUID
	stockClassId: string; // UUID
	quantity: string; // human, e.g. "100000"
	sharePriceAmount: string; // e.g. "4.20"
	customId?: string;
	comments?: string[];
}

export function useDirectIssueStock() {
	const write = useWriteCapTableIssueStock();
	const action = useOnchainAction(write);

	const issueStock = useCallback(
		async (params: DirectIssueStockParams) => {
			if (!action.isConnected) {
				throw new Error("Please connect your wallet");
			}
			if (!params.capTableAddress) {
				throw new Error("Cap table address is required");
			}

			const issuanceId = generateBytes16Id();
			const securityId = generateBytes16Id();

			const stakeholderIdBytes = uuidToBytes16(params.stakeholderId);
			const stockClassIdBytes = uuidToBytes16(params.stockClassId);
			const zeroId = `0x${"0".repeat(32)}` as `0x${string}`;

			const scaledPrice = scaleAmount(params.sharePriceAmount);
			const scaledQuantity = scaleShares(params.quantity);

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

			// Wait for user signature + hash so reverts/rejects throw before UI optimizes
			const writeAsync = write.writeContractAsync ?? write.writeContract;
			const hash = await writeAsync({
				address: params.capTableAddress,
				args: [issuanceParams],
			});

			return { issuanceId, securityId, hash: typeof hash === "string" ? hash : undefined };
		},
		[write, action.isConnected],
	);

	return {
		issueStock,
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
