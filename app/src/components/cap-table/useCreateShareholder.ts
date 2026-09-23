import { useCallback, useRef, useState } from "react";
import { useDirectCreateStakeholder } from "../../hooks/useDirectCreateStakeholder";
import { bytes16ToUuid, generateBytes16Id } from "../../utils/uuid";
import { updateActivity } from "../../utils/activityLog";
import { registerStakeholderOnchain, type StakeholderData } from "../../services/createStakeholder";
import { copy } from "../../lib/copy";
import { RegisterSaveError, useWalletReceipt } from "./useWalletReceipt";
import type { OptimisticStakeholder } from "./types";
import { pushActivity, requireWriteReady, type WriteHost } from "./writeHost";

interface PendingStakeholderSave {
	id: string;
	data: StakeholderData;
	activityId: string;
	hash?: string;
}

export function useCreateShareholder({
	issuerId,
	capTableAddress,
	refreshHoldings,
	setSuccessModal,
	setActivityLog,
}: WriteHost) {
	const direct = useDirectCreateStakeholder();
	const [directStakeholders, setDirectStakeholders] = useState<OptimisticStakeholder[]>([]);
	const [pendingStakeholder, setPendingStakeholder] = useState(false);
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);
	const pendingSaveRef = useRef<PendingStakeholderSave | null>(null);

	const persistStakeholder = useCallback(
		async (meta: PendingStakeholderSave) => {
			await registerStakeholderOnchain({
				issuerId,
				data: meta.data,
				id: meta.id,
				tx_hash: meta.hash || undefined,
			});
			pendingSaveRef.current = null;
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
		(meta: PendingStakeholderSave) => {
			setSuccessModal({
				title: copy.tx.registerFailedTitle,
				message: copy.tx.registerFailed,
				txHash: meta.hash,
				variant: "error",
				retry: () => {
					void persistStakeholder(meta)
						.then(() => {
							setSuccessModal({
								title: copy.tx.confirmedTitle.stakeholder,
								txHash: meta.hash,
								variant: "success",
							});
						})
						.catch(() => presentSaveFailure(meta));
				},
			});
		},
		[persistStakeholder, setSuccessModal],
	);

	useWalletReceipt({
		pending: pendingStakeholder,
		action: direct,
		issuerId,
		pendingActivityId,
		setPendingActivityId,
		setActivityLog,
		setSuccessModal,
		clearPending: () => setPendingStakeholder(false),
		refreshHoldings,
		confirmed: { title: copy.tx.confirmedTitle.stakeholder, variant: "success" },
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
				await persistStakeholder(meta);
			} catch {
				presentSaveFailure(meta);
				throw new RegisterSaveError(copy.tx.registerFailed);
			}
		},
		onReverted: () => {
			const id = pendingSaveRef.current?.id;
			pendingSaveRef.current = null;
			if (!id) return;
			setDirectStakeholders((prev) => prev.filter((sh) => sh._id !== id));
		},
	});

	const handleStakeholder = useCallback(
		async (data: StakeholderData) => {
			if (pendingStakeholder) return;
			const unsaved = pendingSaveRef.current;
			if (unsaved) {
				presentSaveFailure(unsaved);
				return;
			}
			if (!requireWriteReady(direct.isConnected, capTableAddress, setSuccessModal)) return;
			try {
				const stakeholderBytes16 = generateBytes16Id() as `0x${string}`;
				const stakeholderUuid = bytes16ToUuid(stakeholderBytes16);
				const result = await direct.createStakeholder({
					capTableAddress: capTableAddress as `0x${string}`,
					stakeholderType: data.stakeholder_type,
					currentRelationship: data.current_relationship,
					id: stakeholderBytes16,
				});
				const activityId = `sh-${stakeholderUuid}-${Date.now()}`;
				const legalName = data.name?.legal_name || "Shareholder";
				setPendingActivityId(activityId);
				setPendingStakeholder(true);
				pendingSaveRef.current = { id: stakeholderUuid, data, activityId, hash: result.hash };
				setDirectStakeholders((prev) => [
					...prev,
					{
						_id: stakeholderUuid,
						name: data.name,
						stakeholder_type: data.stakeholder_type,
						current_relationship: data.current_relationship,
					},
				]);
				pushActivity(issuerId, setActivityLog, {
					id: activityId,
					issuerId,
					kind: "stakeholder",
					type: "Shareholder created",
					details: legalName,
					date: new Date().toISOString().slice(0, 10),
					txHash: result.hash,
					status: "pending",
					createdAt: Date.now(),
				});
			} catch (err) {
				setSuccessModal({
					title: "Transaction failed",
					message: err instanceof Error ? err.message : "Failed to add shareholder.",
					variant: "error",
				});
			}
		},
		[
			capTableAddress,
			issuerId,
			direct,
			pendingStakeholder,
			presentSaveFailure,
			setSuccessModal,
			setActivityLog,
		],
	);

	return { handleStakeholder, directStakeholders, pendingStakeholder };
}
