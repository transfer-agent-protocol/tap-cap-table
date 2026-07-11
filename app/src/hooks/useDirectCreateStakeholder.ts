import { useCallback } from "react";
import { generateBytes16Id } from "@tap/units";
import { useWriteCapTableCreateStakeholder } from "../generated";
import { useOnchainAction } from "./useOnchainAction";

interface DirectCreateStakeholderParams {
	capTableAddress: `0x${string}`;
	stakeholderType: "INDIVIDUAL" | "INSTITUTION";
	currentRelationship: string;
}

export function useDirectCreateStakeholder() {
	const write = useWriteCapTableCreateStakeholder();
	const action = useOnchainAction(write);

	const createStakeholder = useCallback(
		async (params: DirectCreateStakeholderParams & { id?: `0x${string}` }) => {
			if (!action.isConnected) {
				throw new Error("Please connect your wallet");
			}
			if (!params.capTableAddress) {
				throw new Error("Cap table address is required");
			}

			const stakeholderId = params.id || generateBytes16Id();

			const writeAsync = write.writeContractAsync ?? write.writeContract;
			const hash = await writeAsync({
				address: params.capTableAddress,
				args: [stakeholderId, params.stakeholderType, params.currentRelationship],
			});

			return { stakeholderId, hash: typeof hash === "string" ? hash : undefined };
		},
		[write, action.isConnected],
	);

	return {
		createStakeholder,
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
