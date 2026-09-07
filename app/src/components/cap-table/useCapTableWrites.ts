import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { validateShareCaps } from "@tap/units";
import { useDirectCreateStockClass } from "../../hooks/useDirectCreateStockClass";
import { useDirectCreateStakeholder } from "../../hooks/useDirectCreateStakeholder";
import { useDirectIssueStock } from "../../hooks/useDirectIssueStock";
import { useDirectTransferStock } from "../../hooks/useDirectTransferStock";
import { bytes16ToUuid, generateBytes16Id } from "../../utils/uuid";
import { registerStockClassOnchain, type StockClassData } from "../../services/createStockClass";
import { registerStakeholderOnchain, type StakeholderData } from "../../services/createStakeholder";
import { registerStockIssuanceOnchain, type StockIssuanceData } from "../../services/createStockIssuance";
import { copy } from "../../lib/copy";
import {
	appendActivity,
	type ActivityEntry,
} from "../../utils/activityLog";
import type { TransferStockFormData } from "./forms/TransferStockForm";
import { useWalletReceipt } from "./useWalletReceipt";
import type {
	OptimisticIssuance,
	OptimisticStakeholder,
	OptimisticStockClass,
	SuccessModalState,
} from "./types";

interface UseCapTableWritesArgs {
	issuerId: string;
	capTableAddress: `0x${string}` | "";
	holdings: {
		issuer?: any;
		stockClasses?: any[];
		stakeholders?: any[];
		holdings?: any[];
	} | null;
	refreshHoldings: () => void;
	setSuccessModal: (state: SuccessModalState | null) => void;
	setActivityLog: Dispatch<SetStateAction<ActivityEntry[]>>;
}

export function useCapTableWrites({
	issuerId,
	capTableAddress,
	holdings,
	refreshHoldings,
	setSuccessModal,
	setActivityLog,
}: UseCapTableWritesArgs) {
	const directStockClass = useDirectCreateStockClass();
	const directStakeholder = useDirectCreateStakeholder();
	const directIssuance = useDirectIssueStock();
	const directTransfer = useDirectTransferStock();

	const [directStockClasses, setDirectStockClasses] = useState<OptimisticStockClass[]>([]);
	const [directStakeholders, setDirectStakeholders] = useState<OptimisticStakeholder[]>([]);
	const [directIssuances, setDirectIssuances] = useState<OptimisticIssuance[]>([]);

	const [pendingStockClass, setPendingStockClass] = useState(false);
	const [pendingStakeholder, setPendingStakeholder] = useState(false);
	const [pendingIssuance, setPendingIssuance] = useState(false);
	const [pendingTransfer, setPendingTransfer] = useState(false);

	const [pendingStockClassMeta, setPendingStockClassMeta] = useState<{
		id: string;
		data: StockClassData;
	} | null>(null);
	const [pendingStakeholderMeta, setPendingStakeholderMeta] = useState<{
		id: string;
		data: StakeholderData;
	} | null>(null);
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);

	const requireWriteReady = (): boolean => {
		const connected =
			directStockClass.isConnected ||
			directStakeholder.isConnected ||
			directIssuance.isConnected ||
			directTransfer.isConnected;
		if (!connected) {
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
	};

	const pushActivity = (entry: ActivityEntry) => {
		setActivityLog(appendActivity(issuerId, entry));
	};

	useWalletReceipt({
		pending: pendingStockClass,
		action: directStockClass,
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
			if (pendingStockClassMeta) {
				registerStockClassOnchain({
					issuerId,
					data: pendingStockClassMeta.data,
					id: pendingStockClassMeta.id,
					tx_hash: hash || undefined,
				}).catch((err) => console.warn("Failed to register stock class metadata:", err));
				setPendingStockClassMeta(null);
			}
		},
		onReverted: () => {
			setDirectStockClasses((prev) => prev.slice(0, -1));
			setPendingStockClassMeta(null);
		},
	});

	useWalletReceipt({
		pending: pendingStakeholder,
		action: directStakeholder,
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
			if (pendingStakeholderMeta) {
				registerStakeholderOnchain({
					issuerId,
					data: pendingStakeholderMeta.data,
					id: pendingStakeholderMeta.id,
					tx_hash: hash || undefined,
				}).catch((err) => console.warn("Failed to register stakeholder metadata:", err));
				setPendingStakeholderMeta(null);
			}
		},
		onReverted: () => {
			setDirectStakeholders((prev) => prev.slice(0, -1));
			setPendingStakeholderMeta(null);
		},
	});

	useWalletReceipt({
		pending: pendingIssuance,
		action: directIssuance,
		issuerId,
		pendingActivityId,
		setPendingActivityId,
		setActivityLog,
		setSuccessModal,
		clearPending: () => setPendingIssuance(false),
		refreshHoldings,
		delayedRefresh: true,
		confirmed: { title: copy.tx.confirmedTitle.issuance },
		reverted: {
			title: copy.tx.revertedTitle,
			message: copy.tx.issuanceReverted,
		},
		onConfirmed: (hash) => {
			setDirectIssuances((prev) => {
				if (!prev.length) return prev;
				const next = [...prev];
				next[next.length - 1] = {
					...next[next.length - 1],
					txHash: hash || next[next.length - 1].txHash,
					confirmed: true,
				};
				return next;
			});
		},
		onReverted: () => {
			setDirectIssuances((prev) => prev.slice(0, -1));
		},
	});

	useWalletReceipt({
		pending: pendingTransfer,
		action: directTransfer,
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

	const handleStockClass = useCallback(
		async (data: StockClassData) => {
			if (!requireWriteReady()) return;
			try {
				const stockClassBytes16 = generateBytes16Id() as `0x${string}`;
				const stockClassUuid = bytes16ToUuid(stockClassBytes16);
				const result = await directStockClass.createStockClass({
					capTableAddress: capTableAddress as `0x${string}`,
					classType: data.class_type,
					pricePerShareAmount: data.price_per_share?.amount || "0",
					initialSharesAuthorized: data.initial_shares_authorized,
					id: stockClassBytes16,
				});
				const activityId = `sc-${stockClassUuid}-${Date.now()}`;
				setPendingActivityId(activityId);
				setPendingStockClass(true);
				setPendingStockClassMeta({ id: stockClassUuid, data });
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
				pushActivity({
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
		[capTableAddress, issuerId, directStockClass, setSuccessModal],
	);

	const handleStakeholder = useCallback(
		async (data: StakeholderData) => {
			if (!requireWriteReady()) return;
			try {
				const stakeholderBytes16 = generateBytes16Id() as `0x${string}`;
				const stakeholderUuid = bytes16ToUuid(stakeholderBytes16);
				const result = await directStakeholder.createStakeholder({
					capTableAddress: capTableAddress as `0x${string}`,
					stakeholderType: data.stakeholder_type,
					currentRelationship: data.current_relationship,
					id: stakeholderBytes16,
				});
				const activityId = `sh-${stakeholderUuid}-${Date.now()}`;
				const legalName = data.name?.legal_name || "Shareholder";
				setPendingActivityId(activityId);
				setPendingStakeholder(true);
				setPendingStakeholderMeta({ id: stakeholderUuid, data });
				setDirectStakeholders((prev) => [
					...prev,
					{
						_id: stakeholderUuid,
						name: data.name,
						stakeholder_type: data.stakeholder_type,
						current_relationship: data.current_relationship,
					},
				]);
				pushActivity({
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
		[capTableAddress, issuerId, directStakeholder, setSuccessModal],
	);

	const handleIssuance = useCallback(
		async (data: StockIssuanceData) => {
			if (!requireWriteReady()) return;

			const issuer = holdings?.issuer;
			const stockClass =
				directStockClasses.find((sc) => sc._id === data.stock_class_id) ||
				(holdings?.stockClasses || []).find((sc: any) => sc._id === data.stock_class_id);
			const people = [
				...directStakeholders,
				...(holdings?.stakeholders || []),
				...(holdings?.holdings || []).map((h: { stakeholder?: any }) => h.stakeholder),
			].filter(Boolean);
			const stakeholder = people.find((sh: any) => sh._id === data.stakeholder_id);

			const cap = validateShareCaps({
				quantity: data.quantity,
				issuerAuthorized: issuer?.initial_shares_authorized ?? 0,
				issuerIssued: (holdings?.holdings || []).reduce(
					(sum: number, h: any) => sum + (Number(h.quantity) || 0),
					0,
				),
				classAuthorized: stockClass?.initial_shares_authorized ?? stockClass?.shares_authorized,
				classIssued: (holdings?.holdings || [])
					.filter((h: any) => h.stockClass?._id === data.stock_class_id)
					.reduce((sum: number, h: any) => sum + (Number(h.quantity) || 0), 0),
			});

			if (!cap.ok) {
				setSuccessModal({ title: "Not enough shares", message: cap.errors.join(" ") });
				return;
			}

			try {
				const sessionClass = directStockClasses.find((d) => d._id === data.stock_class_id);
				const onchainOk =
					sessionClass?.onchain === true ||
					stockClass?.is_onchain_synced === true ||
					(stockClass?.is_onchain_synced !== false && !sessionClass && !!stockClass);
				if (!onchainOk || stockClass?.is_onchain_synced === false) {
					if (!sessionClass?.onchain) {
						setSuccessModal({
							title: "Stock class isn’t ready yet",
							message:
								"Go to Stock classes, create the class, and confirm in your wallet. Then come back to Issue stock.",
							variant: "info",
						});
						return;
					}
				}

				const result = await directIssuance.issueStock({
					capTableAddress: capTableAddress as `0x${string}`,
					stakeholderId: data.stakeholder_id,
					stockClassId: data.stock_class_id,
					quantity: data.quantity,
					sharePriceAmount: data.share_price?.amount || "0",
					customId: data.custom_id,
					comments: data.comments,
				});

				const activityId = `iss-${result.issuanceId}-${Date.now()}`;
				const holderName =
					stakeholder?.name?.legal_name || stakeholder?.name?.first_name || "Holder";
				const className = stockClass?.name || "Class";
				setPendingActivityId(activityId);
				setPendingIssuance(true);
				setDirectIssuances((prev) => [
					...prev,
					{
						_id: result.issuanceId,
						security_id: result.securityId,
						quantity: data.quantity,
						stakeholder_id: data.stakeholder_id,
						stock_class_id: data.stock_class_id,
						share_price: data.share_price,
						stakeholder_name: holderName,
						stock_class_name: className,
						custom_id: data.custom_id,
						txHash: result.hash,
						date: new Date().toISOString().slice(0, 10),
					},
				]);
				pushActivity({
					id: activityId,
					issuerId,
					kind: "stock_issuance",
					type: "Stock issued",
					details: data.custom_id || `${holderName} · ${className}`,
					quantity: data.quantity,
					price: data.share_price?.amount
						? `${data.share_price.amount} ${data.share_price.currency || "USD"}`
						: undefined,
					date: new Date().toISOString().slice(0, 10),
					txHash: result.hash,
					status: "pending",
					createdAt: Date.now(),
				});

				registerStockIssuanceOnchain({ issuerId, data }).catch((err) =>
					console.warn("Failed to register stock issuance metadata:", err),
				);
				refreshHoldings();
			} catch (err) {
				setSuccessModal({
					title: "Transaction failed",
					message: err instanceof Error ? err.message : "Failed to issue stock.",
					variant: "error",
				});
			}
		},
		[
			capTableAddress,
			issuerId,
			holdings,
			directStockClasses,
			directStakeholders,
			directIssuance,
			refreshHoldings,
			setSuccessModal,
		],
	);

	const handleTransfer = useCallback(
		async (data: TransferStockFormData) => {
			if (!requireWriteReady()) return;

			const people = [
				...directStakeholders,
				...(holdings?.stakeholders || []),
				...(holdings?.holdings || []).map((h: { stakeholder?: any }) => h.stakeholder),
			].filter(Boolean);
			const from = people.find((s: any) => s._id === data.transferor_id);
			const to = people.find((s: any) => s._id === data.transferee_id);
			const sc =
				directStockClasses.find((c) => c._id === data.stock_class_id) ||
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
				const result = await directTransfer.transferStock({
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
				pushActivity({
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
			directStockClasses,
			directStakeholders,
			directTransfer,
			refreshHoldings,
			setSuccessModal,
		],
	);

	return {
		handleStockClass,
		handleStakeholder,
		handleIssuance,
		handleTransfer,
		directStockClasses,
		directStakeholders,
		directIssuances,
		pendingStockClass,
		pendingStakeholder,
		pendingIssuance,
		pendingTransfer,
	};
}
