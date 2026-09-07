import { useEffect, useRef } from "react";
import {
	markActivityByTx,
	updateActivity,
	type ActivityEntry,
} from "../../utils/activityLog";
import type { SuccessModalState } from "./types";

export interface WalletReceiptAction {
	isConfirmed: boolean;
	isReverted: boolean;
	hash: string | undefined;
	errorMessage: string | null;
	reset: () => void;
}

interface UseWalletReceiptArgs {
	pending: boolean;
	action: WalletReceiptAction;
	issuerId: string;
	pendingActivityId: string | null;
	setPendingActivityId: (id: string | null) => void;
	setActivityLog: (log: ActivityEntry[]) => void;
	setSuccessModal: (state: SuccessModalState | null) => void;
	clearPending: () => void;
	refreshHoldings: () => void;
	/** Extra holdings polls after confirm (issuance / transfer). */
	delayedRefresh?: boolean;
	confirmed: { title: string; variant?: SuccessModalState["variant"] };
	reverted: { title: string; message: string; variant?: SuccessModalState["variant"] };
	onConfirmed?: (hash: string | undefined) => void;
	onReverted?: () => void;
}

/**
 * Shared wallet-receipt lifecycle: pending → confirmed | reverted.
 * Callbacks live on a ref so identity changes do not retrigger the effect.
 */
export function useWalletReceipt(args: UseWalletReceiptArgs) {
	const argsRef = useRef(args);
	argsRef.current = args;

	const delayTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
	useEffect(() => {
		return () => {
			delayTimers.current.forEach(clearTimeout);
			delayTimers.current = [];
		};
	}, []);

	const { pending, isConfirmed, isReverted, hash } = {
		pending: args.pending,
		isConfirmed: args.action.isConfirmed,
		isReverted: args.action.isReverted,
		hash: args.action.hash,
	};

	useEffect(() => {
		const o = argsRef.current;
		if (!o.pending) return;

		if (o.action.isConfirmed) {
			const txHash = o.action.hash;
			o.setSuccessModal({
				title: o.confirmed.title,
				txHash,
				variant: o.confirmed.variant,
			});
			o.onConfirmed?.(txHash);
			if (o.pendingActivityId && o.issuerId) {
				o.setActivityLog(
					updateActivity(o.issuerId, o.pendingActivityId, {
						status: "confirmed",
						txHash: txHash || undefined,
					}),
				);
			} else if (txHash && o.issuerId) {
				o.setActivityLog(markActivityByTx(o.issuerId, txHash, "confirmed"));
			}
			o.setPendingActivityId(null);
			o.clearPending();
			o.action.reset();
			o.refreshHoldings();
			if (o.delayedRefresh) {
				delayTimers.current.forEach(clearTimeout);
				delayTimers.current = [
					setTimeout(() => o.refreshHoldings(), 1500),
					setTimeout(() => o.refreshHoldings(), 4000),
				];
			}
		} else if (o.action.isReverted) {
			o.setSuccessModal({
				title: o.reverted.title,
				message: o.action.errorMessage || o.reverted.message,
				variant: o.reverted.variant,
			});
			if (o.pendingActivityId && o.issuerId) {
				o.setActivityLog(
					updateActivity(o.issuerId, o.pendingActivityId, { status: "reverted" }),
				);
			}
			o.onReverted?.();
			o.setPendingActivityId(null);
			o.clearPending();
			o.action.reset();
		}
	}, [pending, isConfirmed, isReverted, hash]);
}
