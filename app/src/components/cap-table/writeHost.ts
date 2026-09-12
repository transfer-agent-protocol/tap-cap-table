import type { Dispatch, SetStateAction } from "react";
import { copy } from "../../lib/copy";
import { appendActivity, type ActivityEntry } from "../../utils/activityLog";
import type { SuccessModalState } from "./types";

export interface WriteHost {
	issuerId: string;
	capTableAddress: `0x${string}` | "";
	refreshHoldings: () => void;
	setSuccessModal: (state: SuccessModalState | null) => void;
	setActivityLog: Dispatch<SetStateAction<ActivityEntry[]>>;
}

export function requireWriteReady(
	isConnected: boolean,
	capTableAddress: string,
	setSuccessModal: WriteHost["setSuccessModal"],
): boolean {
	if (!isConnected) {
		setSuccessModal({
			title: "Wallet required",
			message: copy.tx.walletRequired,
			variant: "info",
		});
		return false;
	}
	if (!capTableAddress || !capTableAddress.startsWith("0x")) {
		setSuccessModal({
			title: "Contract missing",
			message: copy.tx.contractMissing,
			variant: "error",
		});
		return false;
	}
	return true;
}

export function pushActivity(
	issuerId: string,
	setActivityLog: WriteHost["setActivityLog"],
	entry: ActivityEntry,
) {
	setActivityLog(appendActivity(issuerId, entry));
}
