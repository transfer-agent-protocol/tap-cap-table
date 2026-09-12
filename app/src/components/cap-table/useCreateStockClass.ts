import { useCallback, useState } from "react";
import { useDirectCreateStockClass } from "../../hooks/useDirectCreateStockClass";
import { bytes16ToUuid, generateBytes16Id } from "../../utils/uuid";
import { registerStockClassOnchain, type StockClassData } from "../../services/createStockClass";
import { copy } from "../../lib/copy";
import { useWalletReceipt } from "./useWalletReceipt";
import type { OptimisticStockClass } from "./types";
import { pushActivity, requireWriteReady, type WriteHost } from "./writeHost";

export function useCreateStockClass({
	issuerId,
	capTableAddress,
	refreshHoldings,
	setSuccessModal,
	setActivityLog,
}: WriteHost) {
	const direct = useDirectCreateStockClass();
	const [directStockClasses, setDirectStockClasses] = useState<OptimisticStockClass[]>([]);
	const [pendingStockClass, setPendingStockClass] = useState(false);
	const [pendingMeta, setPendingMeta] = useState<{ id: string; data: StockClassData } | null>(
		null,
	);
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);

	useWalletReceipt({
		pending: pendingStockClass,
		action: direct,
		issuerId,
		pendingActivityId,
		setPendingActivityId,
		setActivityLog,
		setSuccessModal,
		clearPending: () => setPendingStockClass(false),
		refreshHoldings,
		confirmed: { title: copy.tx.confirmedTitle.stockClass, variant: "success" },
		reverted: {
			title: copy.tx.revertedTitle,
			message: copy.tx.revertedGeneric,
			variant: "error",
		},
		onConfirmed: (hash) => {
			setDirectStockClasses((prev) =>
				prev.map((sc, i) => (i === prev.length - 1 ? { ...sc, onchain: true } : sc)),
			);
			if (pendingMeta) {
				registerStockClassOnchain({
					issuerId,
					data: pendingMeta.data,
					id: pendingMeta.id,
					tx_hash: hash || undefined,
				}).catch((err) => console.warn("Failed to register stock class metadata:", err));
				setPendingMeta(null);
			}
		},
		onReverted: () => {
			setDirectStockClasses((prev) => prev.slice(0, -1));
			setPendingMeta(null);
		},
	});

	const handleStockClass = useCallback(
		async (data: StockClassData) => {
			if (!requireWriteReady(direct.isConnected, capTableAddress, setSuccessModal)) return;
			try {
				const stockClassBytes16 = generateBytes16Id() as `0x${string}`;
				const stockClassUuid = bytes16ToUuid(stockClassBytes16);
				const result = await direct.createStockClass({
					capTableAddress: capTableAddress as `0x${string}`,
					classType: data.class_type,
					pricePerShareAmount: data.price_per_share?.amount || "0",
					initialSharesAuthorized: data.initial_shares_authorized,
					id: stockClassBytes16,
				});
				const activityId = `sc-${stockClassUuid}-${Date.now()}`;
				setPendingActivityId(activityId);
				setPendingStockClass(true);
				setPendingMeta({ id: stockClassUuid, data });
				setDirectStockClasses((prev) => [
					...prev,
					{
						_id: stockClassUuid,
						name: data.name,
						class_type: data.class_type,
						initial_shares_authorized: data.initial_shares_authorized,
						onchain: false,
					},
				]);
				pushActivity(issuerId, setActivityLog, {
					id: activityId,
					issuerId,
					kind: "stock_class",
					type: "Stock class created",
					details: data.name,
					date: new Date().toISOString().slice(0, 10),
					txHash: result.hash,
					status: "pending",
					createdAt: Date.now(),
				});
			} catch (err) {
				setSuccessModal({
					title: "Transaction failed",
					message: err instanceof Error ? err.message : "Failed to create share class.",
					variant: "error",
				});
			}
		},
		[capTableAddress, issuerId, direct, setSuccessModal, setActivityLog],
	);

	return { handleStockClass, directStockClasses, pendingStockClass };
}
