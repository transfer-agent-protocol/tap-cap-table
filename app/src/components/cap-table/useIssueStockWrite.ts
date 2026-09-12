import { useCallback, useState } from "react";
import { validateShareCaps } from "@tap/units";
import { useDirectIssueStock } from "../../hooks/useDirectIssueStock";
import { registerStockIssuanceOnchain, type StockIssuanceData } from "../../services/createStockIssuance";
import { copy } from "../../lib/copy";
import { useWalletReceipt } from "./useWalletReceipt";
import type { OptimisticIssuance, OptimisticStakeholder, OptimisticStockClass } from "./types";
import { pushActivity, requireWriteReady, type WriteHost } from "./writeHost";

interface UseIssueStockWriteArgs extends WriteHost {
	holdings: {
		issuer?: any;
		stockClasses?: any[];
		stakeholders?: any[];
		holdings?: any[];
	} | null;
	sessionClasses: OptimisticStockClass[];
	sessionPeople: OptimisticStakeholder[];
}

export function useIssueStockWrite({
	issuerId,
	capTableAddress,
	holdings,
	sessionClasses,
	sessionPeople,
	refreshHoldings,
	setSuccessModal,
	setActivityLog,
}: UseIssueStockWriteArgs) {
	const direct = useDirectIssueStock();
	const [directIssuances, setDirectIssuances] = useState<OptimisticIssuance[]>([]);
	const [pendingIssuance, setPendingIssuance] = useState(false);
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);

	useWalletReceipt({
		pending: pendingIssuance,
		action: direct,
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

	const handleIssuance = useCallback(
		async (data: StockIssuanceData) => {
			if (!requireWriteReady(direct.isConnected, capTableAddress, setSuccessModal)) return;

			const issuer = holdings?.issuer;
			const stockClass =
				sessionClasses.find((sc) => sc._id === data.stock_class_id) ||
				(holdings?.stockClasses || []).find((sc: any) => sc._id === data.stock_class_id);
			const people = [
				...sessionPeople,
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
				const sessionClass = sessionClasses.find((d) => d._id === data.stock_class_id);
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

				const result = await direct.issueStock({
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
				pushActivity(issuerId, setActivityLog, {
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
			sessionClasses,
			sessionPeople,
			direct,
			refreshHoldings,
			setSuccessModal,
			setActivityLog,
		],
	);

	return { handleIssuance, directIssuances, pendingIssuance };
}
