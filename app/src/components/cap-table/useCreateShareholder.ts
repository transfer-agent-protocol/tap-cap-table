import { useCallback, useState } from "react";
import { useDirectCreateStakeholder } from "../../hooks/useDirectCreateStakeholder";
import { bytes16ToUuid, generateBytes16Id } from "../../utils/uuid";
import { registerStakeholderOnchain, type StakeholderData } from "../../services/createStakeholder";
import { copy } from "../../lib/copy";
import { useWalletReceipt } from "./useWalletReceipt";
import type { OptimisticStakeholder } from "./types";
import { pushActivity, requireWriteReady, type WriteHost } from "./writeHost";

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
	const [pendingMeta, setPendingMeta] = useState<{ id: string; data: StakeholderData } | null>(
		null,
	);
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);

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
		onConfirmed: (hash) => {
			if (pendingMeta) {
				registerStakeholderOnchain({
					issuerId,
					data: pendingMeta.data,
					id: pendingMeta.id,
					tx_hash: hash || undefined,
				}).catch((err) => console.warn("Failed to register stakeholder metadata:", err));
				setPendingMeta(null);
			}
		},
		onReverted: () => {
			setDirectStakeholders((prev) => prev.slice(0, -1));
			setPendingMeta(null);
		},
	});

	const handleStakeholder = useCallback(
		async (data: StakeholderData) => {
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
				setPendingMeta({ id: stakeholderUuid, data });
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
		[capTableAddress, issuerId, direct, setSuccessModal, setActivityLog],
	);

	return { handleStakeholder, directStakeholders, pendingStakeholder };
}
