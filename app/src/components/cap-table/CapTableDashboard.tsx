import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { FullScreenStack, StatusBox } from "../wrappers";
import { IssuerHeader } from "../IssuerHeader";
import { HoldingsTable } from "../HoldingsTable";
import { TxSuccessModal } from "../TxSuccessModal";
import { useCapTableManager } from "../../hooks/useCapTableManager";
import { useDirectCreateStockClass } from "../../hooks/useDirectCreateStockClass";
import { useDirectCreateStakeholder } from "../../hooks/useDirectCreateStakeholder";
import { useDirectIssueStock } from "../../hooks/useDirectIssueStock";
import { bytes16ToUuid, generateBytes16Id } from "../../utils/uuid";
import { validateShareCaps } from "@tap/units";
import { fetchHistoricalTransactions } from "../../services/fetchHistoricalTransactions";
import { registerStockClassOnchain, type StockClassData } from "../../services/createStockClass";
import { registerStakeholderOnchain, type StakeholderData } from "../../services/createStakeholder";
import { registerStockIssuanceOnchain, type StockIssuanceData } from "../../services/createStockIssuance";
import type { IssuerResponse } from "../../services/registerIssuer";
import { copy } from "../../lib/copy";
import { capTableHref, parseCapTableView, type CapTableView } from "../navConfig";
import { issuanceStillSyncing } from "../../utils/holdingStatus";
import {
	appendActivity,
	loadActivity,
	markActivityByTx,
	updateActivity,
	type ActivityEntry,
} from "../../utils/activityLog";
import {
	dedupeById,
	type CapTableDashboardProps,
	type OptimisticIssuance,
	type OptimisticStakeholder,
	type OptimisticStockClass,
	type SuccessModalState,
} from "./types";
import { CapTableToolbar } from "./CapTableToolbar";
import { HoldingsView } from "./views/HoldingsView";
import { ShareholdersView } from "./views/ShareholdersView";
import { StockClassesView } from "./views/StockClassesView";
import { IssueStockView } from "./views/IssueStockView";
import { TransactionsView } from "./views/TransactionsView";

/**
 * Company cap-table workspace orchestrator.
 * Views live under ./views; this file owns wallet writes + server refresh.
 */
export function CapTableDashboard({ issuerResult, onReset }: CapTableDashboardProps) {
	const router = useRouter();
	const currentView: CapTableView = parseCapTableView(router.query.view as string | undefined);

	const directStockClass = useDirectCreateStockClass();
	const directStakeholder = useDirectCreateStakeholder();
	const directIssuance = useDirectIssueStock();

	// Prefer live holdings.issuer.deployed_to when the page hydrated without it
	// (stale localStorage) so writes and the header use the real contract.

	const [directStockClasses, setDirectStockClasses] = useState<OptimisticStockClass[]>([]);
	const [directStakeholders, setDirectStakeholders] = useState<OptimisticStakeholder[]>([]);
	const [directIssuances, setDirectIssuances] = useState<OptimisticIssuance[]>([]);

	const [pendingStockClass, setPendingStockClass] = useState(false);
	const [pendingStakeholder, setPendingStakeholder] = useState(false);
	const [pendingIssuance, setPendingIssuance] = useState(false);

	const [successModal, setSuccessModal] = useState<SuccessModalState | null>(null);

	const [pendingStockClassMeta, setPendingStockClassMeta] = useState<{
		id: string;
		data: StockClassData;
	} | null>(null);
	const [pendingStakeholderMeta, setPendingStakeholderMeta] = useState<{
		id: string;
		data: StakeholderData;
	} | null>(null);

	const [historicalTransactions, setHistoricalTransactions] = useState<any[]>([]);
	const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [syncNote, setSyncNote] = useState<string | null>(null);
	const [addingShareholder, setAddingShareholder] = useState(false);
	const [addingStockClass, setAddingStockClass] = useState(false);
	const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);
	const [hasPendingSyncFlag, setHasPendingSyncFlag] = useState(false);

	// Self-heal: if page hydrated without deployed_to, re-fetch full issuer once
	const [healedIssuer, setHealedIssuer] = useState<IssuerResponse | null>(null);
	useEffect(() => {
		if (!issuerResult?._id) return;
		if (issuerResult.deployed_to?.startsWith("0x")) {
			setHealedIssuer(null);
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(
					`/api/issuer/full/${encodeURIComponent(issuerResult._id)}`,
					{ cache: "no-store" },
				);
				if (!res.ok || cancelled) return;
				const full = await res.json();
				if (cancelled || !full?._id) return;
				if (full.deployed_to?.startsWith("0x")) {
					setHealedIssuer({
						_id: full._id,
						legal_name: full.legal_name || issuerResult.legal_name,
						deployed_to: full.deployed_to,
						tx_hash: full.tx_hash || issuerResult.tx_hash || "",
					});
				}
			} catch {
				// non-blocking
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [issuerResult?._id, issuerResult.deployed_to, issuerResult.legal_name, issuerResult.tx_hash]);

	const effectiveIssuer = healedIssuer || issuerResult;
	const manager = useCapTableManager(effectiveIssuer, { shouldPoll: hasPendingSyncFlag });

	const capTableAddress = (
		manager.holdings?.issuer?.deployed_to ||
		effectiveIssuer.deployed_to ||
		""
	) as `0x${string}` | "";

	const requireWriteReady = (): boolean => {
		const connected =
			directStockClass.isConnected ||
			directStakeholder.isConnected ||
			directIssuance.isConnected;
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

	useEffect(() => {
		if (!effectiveIssuer?._id) return;
		setActivityLog(loadActivity(effectiveIssuer._id));
	}, [effectiveIssuer?._id]);

	// Soft reconcile on open (ghost flags + missing TX hashes)
	useEffect(() => {
		if (!effectiveIssuer?._id) return;
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch(`/api/issuer/reconcile`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ issuerId: effectiveIssuer._id }),
				});
				if (!res.ok || cancelled) return;
				const json = await res.json();
				if (cancelled) return;
				const n = Number(json.txHashesBackfilled || 0);
				const fixed =
					(json.fixedClasses?.length || 0) + (json.fixedPeople?.length || 0);
				if (n > 0 || fixed > 0) {
					manager.refreshHoldings();
					if (n > 0) setSyncNote(copy.sync.linkedTx(n));
					else setSyncNote(copy.sync.fixedRecords);
				}
			} catch {
				// non-blocking
			}
		})();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [effectiveIssuer?._id]);

	// Stock class receipt
	useEffect(() => {
		if (!pendingStockClass) return;
		if (directStockClass.isConfirmed) {
			const hash = directStockClass.hash;
			setSuccessModal({
				title: copy.tx.confirmedTitle.stockClass,
				txHash: hash,
				variant: "success",
			});
			setDirectStockClasses((prev) =>
				prev.map((sc, i) => (i === prev.length - 1 ? { ...sc, onchain: true } : sc)),
			);
			if (pendingStockClassMeta) {
				registerStockClassOnchain({
					issuerId: issuerResult._id,
					data: pendingStockClassMeta.data,
					id: pendingStockClassMeta.id,
					tx_hash: hash || undefined,
				}).catch((err) => console.warn("Failed to register stock class metadata:", err));
				setPendingStockClassMeta(null);
			}
			if (pendingActivityId && issuerResult._id) {
				setActivityLog(
					updateActivity(issuerResult._id, pendingActivityId, {
						status: "confirmed",
						txHash: hash || undefined,
					}),
				);
			} else if (hash && issuerResult._id) {
				setActivityLog(markActivityByTx(issuerResult._id, hash, "confirmed"));
			}
			setPendingActivityId(null);
			setPendingStockClass(false);
			directStockClass.reset();
			manager.refreshHoldings();
		} else if (directStockClass.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directStockClass.errorMessage || copy.tx.revertedGeneric,
				variant: "error",
			});
			if (pendingActivityId && issuerResult._id) {
				setActivityLog(
					updateActivity(issuerResult._id, pendingActivityId, { status: "reverted" }),
				);
			}
			setDirectStockClasses((prev) => prev.slice(0, -1));
			setPendingStockClassMeta(null);
			setPendingActivityId(null);
			setPendingStockClass(false);
			directStockClass.reset();
		}
	}, [
		directStockClass.isConfirmed,
		directStockClass.isReverted,
		directStockClass.hash,
		pendingStockClass,
		directStockClass,
		pendingActivityId,
		issuerResult._id,
		pendingStockClassMeta,
		manager,
	]);

	// Shareholder receipt
	useEffect(() => {
		if (!pendingStakeholder) return;
		if (directStakeholder.isConfirmed) {
			const hash = directStakeholder.hash;
			setSuccessModal({
				title: copy.tx.confirmedTitle.stakeholder,
				txHash: hash,
				variant: "success",
			});
			if (pendingStakeholderMeta) {
				registerStakeholderOnchain({
					issuerId: issuerResult._id,
					data: pendingStakeholderMeta.data,
					id: pendingStakeholderMeta.id,
					tx_hash: hash || undefined,
				}).catch((err) => console.warn("Failed to register stakeholder metadata:", err));
				setPendingStakeholderMeta(null);
			}
			if (pendingActivityId && issuerResult._id) {
				setActivityLog(
					updateActivity(issuerResult._id, pendingActivityId, {
						status: "confirmed",
						txHash: hash || undefined,
					}),
				);
			} else if (hash && issuerResult._id) {
				setActivityLog(markActivityByTx(issuerResult._id, hash, "confirmed"));
			}
			setPendingActivityId(null);
			setPendingStakeholder(false);
			directStakeholder.reset();
			manager.refreshHoldings();
		} else if (directStakeholder.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directStakeholder.errorMessage || copy.tx.revertedGeneric,
				variant: "error",
			});
			if (pendingActivityId && issuerResult._id) {
				setActivityLog(
					updateActivity(issuerResult._id, pendingActivityId, { status: "reverted" }),
				);
			}
			setDirectStakeholders((prev) => prev.slice(0, -1));
			setPendingStakeholderMeta(null);
			setPendingActivityId(null);
			setPendingStakeholder(false);
			directStakeholder.reset();
		}
	}, [
		directStakeholder.isConfirmed,
		directStakeholder.isReverted,
		directStakeholder.hash,
		pendingStakeholder,
		directStakeholder,
		pendingActivityId,
		issuerResult._id,
		pendingStakeholderMeta,
		manager,
	]);

	// Issuance receipt
	useEffect(() => {
		if (!pendingIssuance) return;
		if (directIssuance.isConfirmed) {
			const hash = directIssuance.hash;
			setSuccessModal({
				title: copy.tx.confirmedTitle.issuance,
				txHash: hash,
			});
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
			if (pendingActivityId && issuerResult._id) {
				setActivityLog(
					updateActivity(issuerResult._id, pendingActivityId, {
						status: "confirmed",
						txHash: hash || undefined,
					}),
				);
			} else if (hash && issuerResult._id) {
				setActivityLog(markActivityByTx(issuerResult._id, hash, "confirmed"));
			}
			setPendingActivityId(null);
			setPendingIssuance(false);
			directIssuance.reset();
			manager.refreshHoldings();
			const t1 = setTimeout(() => manager.refreshHoldings(), 1500);
			const t2 = setTimeout(() => manager.refreshHoldings(), 4000);
			return () => {
				clearTimeout(t1);
				clearTimeout(t2);
			};
		} else if (directIssuance.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directIssuance.errorMessage || copy.tx.issuanceReverted,
			});
			if (pendingActivityId && issuerResult._id) {
				setActivityLog(
					updateActivity(issuerResult._id, pendingActivityId, { status: "reverted" }),
				);
			}
			setDirectIssuances((prev) => prev.slice(0, -1));
			setPendingActivityId(null);
			setPendingIssuance(false);
			directIssuance.reset();
		}
	}, [
		directIssuance.isConfirmed,
		directIssuance.isReverted,
		directIssuance.hash,
		pendingIssuance,
		directIssuance,
		manager,
		pendingActivityId,
		issuerResult._id,
	]);

	const loadHistory = useCallback(() => {
		if (!issuerResult?._id) return;
		setIsLoadingHistory(true);
		fetchHistoricalTransactions(issuerResult._id)
			.then((res: any) => {
				const list = Array.isArray(res)
					? res
					: Array.isArray(res?.transactions)
						? res.transactions
						: [];
				setHistoricalTransactions(list);
			})
			.catch((err) => console.warn("Failed to load historical transactions", err))
			.finally(() => setIsLoadingHistory(false));
	}, [issuerResult?._id]);

	useEffect(() => {
		if (currentView === "transactions" || currentView === "overview") {
			loadHistory();
		}
	}, [currentView, loadHistory, directIssuances.length]);

	const stockClassOptions = useMemo(() => {
		const fromHoldings = manager.holdings?.stockClasses || [];
		return dedupeById([...fromHoldings, ...directStockClasses]);
	}, [manager.holdings?.stockClasses, directStockClasses]);

	const issuableStockClasses = useMemo(() => {
		return stockClassOptions.filter((sc: any) => {
			if (sc.onchain) return true;
			if (sc.is_onchain_synced === true) return true;
			const session = directStockClasses.find((d) => d._id === sc._id);
			if (session) return !!session.onchain;
			if (sc.is_onchain_synced === false) return false;
			return true;
		});
	}, [stockClassOptions, directStockClasses]);

	const stakeholderOptions = useMemo(() => {
		const fromServer = manager.holdings?.stakeholders || [];
		const fromHoldings = (manager.holdings?.holdings || [])
			.map((h: { stakeholder?: any }) => h.stakeholder)
			.filter(Boolean);
		return dedupeById([...fromServer, ...fromHoldings, ...directStakeholders]);
	}, [manager.holdings?.stakeholders, manager.holdings?.holdings, directStakeholders]);

	const syncedHoldingKeys = new Set(
		(manager.holdings?.holdings || []).map(
			(h: any) => `${h.stakeholder?._id}|${h.stockClass?._id}`,
		),
	);
	const hasPendingSync =
		pendingStockClass ||
		pendingStakeholder ||
		pendingIssuance ||
		directIssuances.some((iss) => issuanceStillSyncing(iss, syncedHoldingKeys));

	useEffect(() => {
		setHasPendingSyncFlag(hasPendingSync);
	}, [hasPendingSync]);

	const refreshCompany = async () => {
		setIsRefreshing(true);
		setSyncNote(null);
		try {
			const reconcileRes = await fetch(`/api/issuer/reconcile`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ issuerId: effectiveIssuer._id }),
			});
			const reconcileText = await reconcileRes.text();
			let reconcileJson: any = null;
			try {
				reconcileJson = JSON.parse(reconcileText);
			} catch {
				setSyncNote(copy.sync.failed);
				return;
			}
			if (!reconcileRes.ok) {
				setSyncNote(copy.sync.failed);
				return;
			}

			await Promise.all([manager.refreshHoldings(), Promise.resolve(loadHistory())]);

			const n = Number(reconcileJson.txHashesBackfilled || 0);
			const fixed =
				(reconcileJson.fixedClasses?.length || 0) + (reconcileJson.fixedPeople?.length || 0);
			const ghosts = reconcileJson.stillGhostClasses?.length || 0;
			if (n > 0) setSyncNote(copy.sync.linkedTx(n));
			else if (fixed > 0) setSyncNote(copy.sync.fixedRecords);
			else if (ghosts > 0) setSyncNote(copy.sync.ghostClasses);
			else setSyncNote(copy.sync.upToDate);
		} catch {
			setSyncNote(copy.sync.failed);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleStockClass = async (data: StockClassData) => {
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
			setActivityLog(
				appendActivity(issuerResult._id, {
					id: activityId,
					issuerId: issuerResult._id,
					kind: "stock_class",
					type: "Stock class created",
					details: data.name,
					date: new Date().toISOString().slice(0, 10),
					txHash: result.hash,
					status: "pending",
					createdAt: Date.now(),
				}),
			);
		} catch (err) {
			setSuccessModal({
				title: "Transaction failed",
				message: err instanceof Error ? err.message : "Failed to create share class.",
				variant: "error",
			});
		}
	};

	const handleStakeholder = async (data: StakeholderData) => {
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
			setActivityLog(
				appendActivity(issuerResult._id, {
					id: activityId,
					issuerId: issuerResult._id,
					kind: "stakeholder",
					type: "Shareholder created",
					details: legalName,
					date: new Date().toISOString().slice(0, 10),
					txHash: result.hash,
					status: "pending",
					createdAt: Date.now(),
				}),
			);
		} catch (err) {
			setSuccessModal({
				title: "Transaction failed",
				message: err instanceof Error ? err.message : "Failed to add shareholder.",
				variant: "error",
			});
		}
	};

	const handleIssuance = async (data: StockIssuanceData) => {
		if (!requireWriteReady()) return;

		const issuer = manager.holdings?.issuer;
		const stockClass =
			stockClassOptions.find((sc: any) => sc._id === data.stock_class_id) ||
			(manager.holdings?.stockClasses || []).find((sc: any) => sc._id === data.stock_class_id);
		const stakeholder = stakeholderOptions.find((sh: any) => sh._id === data.stakeholder_id);

		const cap = validateShareCaps({
			quantity: data.quantity,
			issuerAuthorized: issuer?.initial_shares_authorized ?? 0,
			issuerIssued: (manager.holdings?.holdings || []).reduce(
				(sum: number, h: any) => sum + (Number(h.quantity) || 0),
				0,
			),
			classAuthorized: stockClass?.initial_shares_authorized ?? stockClass?.shares_authorized,
			classIssued: (manager.holdings?.holdings || [])
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
			setActivityLog(
				appendActivity(issuerResult._id, {
					id: activityId,
					issuerId: issuerResult._id,
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
				}),
			);

			registerStockIssuanceOnchain({ issuerId: issuerResult._id, data }).catch((err) =>
				console.warn("Failed to register stock issuance metadata:", err),
			);
			manager.refreshHoldings();
		} catch (err) {
			setSuccessModal({
				title: "Transaction failed",
				message: err instanceof Error ? err.message : "Failed to issue stock.",
				variant: "error",
			});
		}
	};

	const onchainClassCount = issuableStockClasses.length;
	const peopleCount = stakeholderOptions.length;
	const positionCount =
		(manager.holdings?.holdings || []).length +
		directIssuances.filter((i) => i.confirmed || i.txHash).length;
	const ghostClassCount = stockClassOptions.length - onchainClassCount;

	const holdingsEmptyHint =
		positionCount === 0 && directIssuances.length === 0
			? onchainClassCount === 0
				? "Nothing issued yet. Create a stock class, add a shareholder, then issue stock."
				: peopleCount === 0
					? "No shares issued yet. Add a shareholder, then issue stock."
					: "No shares issued yet. Open Issue stock to grant shares."
			: undefined;

	const toolbar = (
		<CapTableToolbar
			onRefresh={refreshCompany}
			busy={isRefreshing || manager.isLoadingHoldings || isLoadingHistory}
		/>
	);

	const goTo = (view: CapTableView) => {
		router.push(capTableHref(issuerResult._id, view));
	};

	const holdingsTable = (
		<HoldingsTable
			holdingsData={manager.holdings}
			createdStockClasses={directStockClasses}
			createdStakeholders={directStakeholders}
			createdIssuances={directIssuances}
			isLoading={manager.isLoadingHoldings}
			error={manager.holdingsError}
			compact
			emptyHint={holdingsEmptyHint}
		/>
	);

	let main: ReactNode;
	if (currentView === "stock-classes") {
		main = (
			<StockClassesView
				stockClasses={stockClassOptions}
				sessionClasses={directStockClasses}
				activityLog={activityLog}
				ghostClassCount={ghostClassCount}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				adding={addingStockClass}
				onAddingChange={setAddingStockClass}
				onSubmit={handleStockClass}
				toolbar={toolbar}
			/>
		);
	} else if (currentView === "stakeholders") {
		main = (
			<ShareholdersView
				stakeholders={stakeholderOptions}
				activityLog={activityLog}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				adding={addingShareholder}
				onAddingChange={setAddingShareholder}
				onSubmit={handleStakeholder}
				toolbar={toolbar}
			/>
		);
	} else if (currentView === "issue-stock") {
		main = (
			<IssueStockView
				stockClasses={issuableStockClasses}
				stakeholders={stakeholderOptions}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				onSubmit={handleIssuance}
				toolbar={toolbar}
			/>
		);
	} else if (currentView === "transactions") {
		main = (
			<TransactionsView
				activityLog={activityLog}
				historicalTransactions={historicalTransactions}
				isLoadingHistory={isLoadingHistory}
				syncNote={syncNote}
				toolbar={toolbar}
			/>
		);
	} else {
		main = (
			<HoldingsView
				positionCount={positionCount}
				peopleCount={peopleCount}
				onchainClassCount={onchainClassCount}
				ghostClassCount={ghostClassCount}
				hasPendingSync={hasPendingSync}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				toolbar={toolbar}
				holdingsTable={holdingsTable}
				onNavigate={goTo}
			/>
		);
	}

	return (
		<FullScreenStack data-testid="cap-table-dashboard">
			<IssuerHeader
				issuer={{
					...effectiveIssuer,
					deployed_to: capTableAddress || effectiveIssuer.deployed_to,
				}}
				contractAddress={capTableAddress || manager.contractAddress}
				onReset={onReset}
			/>
			{manager.holdingsError && (
				<StatusBox $variant="error">
					{copy.errors.holdingsHttp(manager.holdingsError)}
				</StatusBox>
			)}
			{main}
			<TxSuccessModal
				isOpen={!!successModal}
				onClose={() => setSuccessModal(null)}
				title={successModal?.title || ""}
				txHash={successModal?.txHash}
				message={successModal?.message}
				variant={successModal?.variant || "success"}
			/>
		</FullScreenStack>
	);
}
