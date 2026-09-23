import { useCallback, useRef, useState } from "react";
import { useDirectCreateStockClass } from "../../hooks/useDirectCreateStockClass";
import { bytes16ToUuid, generateBytes16Id } from "../../utils/uuid";
import { updateActivity } from "../../utils/activityLog";
import { registerStockClassOnchain, type StockClassData } from "../../services/createStockClass";
import { copy } from "../../lib/copy";
import { RegisterSaveError, useWalletReceipt } from "./useWalletReceipt";
import type { OptimisticStockClass } from "./types";
import { pushActivity, requireWriteReady, type WriteHost } from "./writeHost";

interface PendingClassSave {
	id: string;
	data: StockClassData;
	activityId: string;
	hash?: string;
}

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
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);
	const pendingSaveRef = useRef<PendingClassSave | null>(null);

	const persistClass = useCallback(
		async (meta: PendingClassSave) => {
			await registerStockClassOnchain({
				issuerId,
				data: meta.data,
				id: meta.id,
				tx_hash: meta.hash || undefined,
			});
			pendingSaveRef.current = null;
			setDirectStockClasses((prev) =>
				prev.map((sc) => (sc._id === meta.id ? { ...sc, onchain: true } : sc)),
			);
			setActivityLog(
				updateActivity(issuerId, meta.activityId, {
					status: "confirmed",
					txHash: meta.hash,
				}),
			);
			refreshHoldings();
		},
		[issuerId, refreshHoldings, setActivityLog],
	);

	const presentSaveFailure = useCallback(
		(meta: PendingClassSave) => {
			setSuccessModal({
				title: copy.tx.registerFailedTitle,
				message: copy.tx.registerFailed,
				txHash: meta.hash,
				variant: "error",
				retry: () => {
					void persistClass(meta)
						.then(() => {
							setSuccessModal({
								title: copy.tx.confirmedTitle.stockClass,
								txHash: meta.hash,
								variant: "success",
							});
						})
						.catch(() => presentSaveFailure(meta));
				},
			});
		},
		[persistClass, setSuccessModal],
	);

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
		onConfirmed: async (hash) => {
			const meta = pendingSaveRef.current;
			if (!meta) return;
			meta.hash = hash;
			try {
				await persistClass(meta);
			} catch {
				presentSaveFailure(meta);
				throw new RegisterSaveError(copy.tx.registerFailed);
			}
		},
		onReverted: () => {
			const id = pendingSaveRef.current?.id;
			pendingSaveRef.current = null;
			if (!id) return;
			setDirectStockClasses((prev) => prev.filter((sc) => sc._id !== id));
		},
	});

	const handleStockClass = useCallback(
		async (data: StockClassData) => {
			if (pendingStockClass) return;
			const unsaved = pendingSaveRef.current;
			if (unsaved) {
				presentSaveFailure(unsaved);
				return;
			}
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
				pendingSaveRef.current = { id: stockClassUuid, data, activityId, hash: result.hash };
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
		[capTableAddress, issuerId, direct, pendingStockClass, presentSaveFailure, setSuccessModal, setActivityLog],
	);

	return { handleStockClass, directStockClasses, pendingStockClass };
}
