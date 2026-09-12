import { useCallback, useState } from "react";
import { useDirectTransferStock } from "../../hooks/useDirectTransferStock";
import { copy } from "../../lib/copy";
import type { TransferStockFormData } from "./forms/TransferStockForm";
import { useWalletReceipt } from "./useWalletReceipt";
import type { OptimisticStakeholder, OptimisticStockClass } from "./types";
import { pushActivity, requireWriteReady, type WriteHost } from "./writeHost";

interface UseTransferStockWriteArgs extends WriteHost {
	holdings: {
		stockClasses?: any[];
		stakeholders?: any[];
		holdings?: any[];
	} | null;
	sessionClasses: OptimisticStockClass[];
	sessionPeople: OptimisticStakeholder[];
}

export function useTransferStockWrite({
	issuerId,
	capTableAddress,
	holdings,
	sessionClasses,
	sessionPeople,
	refreshHoldings,
	setSuccessModal,
	setActivityLog,
}: UseTransferStockWriteArgs) {
	const direct = useDirectTransferStock();
	const [pendingTransfer, setPendingTransfer] = useState(false);
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);

	useWalletReceipt({
		pending: pendingTransfer,
		action: direct,
		issuerId,
		pendingActivityId,
		setPendingActivityId,
		setActivityLog,
		setSuccessModal,
		clearPending: () => setPendingTransfer(false),
		refreshHoldings,
		delayedRefresh: true,
		confirmed: { title: copy.transfer.confirmedTitle, variant: "success" },
		reverted: {
			title: copy.tx.revertedTitle,
			message: copy.tx.revertedGeneric,
			variant: "error",
		},
	});

	const handleTransfer = useCallback(
		async (data: TransferStockFormData) => {
			if (!requireWriteReady(direct.isConnected, capTableAddress, setSuccessModal)) return;

			const people = [
				...sessionPeople,
				...(holdings?.stakeholders || []),
				...(holdings?.holdings || []).map((h: { stakeholder?: any }) => h.stakeholder),
			].filter(Boolean);
			const from = people.find((s: any) => s._id === data.transferor_id);
			const to = people.find((s: any) => s._id === data.transferee_id);
			const sc =
				sessionClasses.find((c) => c._id === data.stock_class_id) ||
				(holdings?.stockClasses || []).find((c: any) => c._id === data.stock_class_id);

			const held = (holdings?.holdings || [])
				.filter(
					(h: any) =>
						h.stakeholder?._id === data.transferor_id &&
						h.stockClass?._id === data.stock_class_id,
				)
				.reduce((sum: number, h: any) => sum + (Number(h.quantity) || 0), 0);

			const qty = Number(data.quantity);
			if (!Number.isFinite(qty) || qty <= 0) {
				setSuccessModal({
					title: "Invalid quantity",
					message: "Enter a positive number of shares to transfer.",
					variant: "info",
				});
				return;
			}
			if (qty > held) {
				setSuccessModal({
					title: "Not enough shares",
					message: `${from?.name?.legal_name || "Transferor"} only holds ${held.toLocaleString()} of this class.`,
					variant: "info",
				});
				return;
			}

			try {
				const result = await direct.transferStock({
					capTableAddress: capTableAddress as `0x${string}`,
					transferorId: data.transferor_id,
					transfereeId: data.transferee_id,
					stockClassId: data.stock_class_id,
					quantity: data.quantity,
					sharePriceAmount: data.share_price?.amount || "0",
				});

				const fromName = from?.name?.legal_name || "From";
				const toName = to?.name?.legal_name || "To";
				const className = sc?.name || "Class";
				const activityId = `xfer-${data.transferor_id.slice(0, 8)}-${Date.now()}`;
				setPendingActivityId(activityId);
				setPendingTransfer(true);
				pushActivity(issuerId, setActivityLog, {
					id: activityId,
					issuerId,
					kind: "stock_transfer",
					type: "Stock transferred",
					details: `${fromName} → ${toName} · ${className}`,
					quantity: data.quantity,
					price: data.share_price?.amount
						? `${data.share_price.amount} ${data.share_price.currency || "USD"}`
						: undefined,
					date: new Date().toISOString().slice(0, 10),
					txHash: result.hash,
					status: "pending",
					createdAt: Date.now(),
				});
				refreshHoldings();
			} catch (err) {
				setSuccessModal({
					title: "Transaction failed",
					message: err instanceof Error ? err.message : "Failed to transfer stock.",
					variant: "error",
				});
			}
		},
		[
			capTableAddress,
			issuerId,
			holdings,
			sessionClasses,
			sessionPeople,
			direct,
			refreshHoldings,
			setSuccessModal,
			setActivityLog,
		],
	);

	return { handleTransfer, pendingTransfer };
}
