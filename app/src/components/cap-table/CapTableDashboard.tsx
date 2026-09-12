import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { Stack } from "../layout";
import { StatusMessage } from "../elements";
import { IssuerHeader } from "./forms/IssuerHeader";
import { HoldingsTable } from "./forms/HoldingsTable";
import { TxSuccessModal } from "../TxSuccessModal";
import { useCapTableManager } from "../../hooks/useCapTableManager";
import { fetchHistoricalTransactions } from "../../services/fetchHistoricalTransactions";
import type { IssuerResponse } from "../../services/registerIssuer";
import { copy } from "../../lib/copy";
import { capTableHref, parseCapTableView, type CapTableView } from "../shell/navConfig";
import { issuanceStillSyncing } from "../../utils/holdingStatus";
import { loadActivity, type ActivityEntry } from "../../utils/activityLog";
import {
	dedupeById,
	type CapTableDashboardProps,
	type SuccessModalState,
} from "./types";
import { CapTableToolbar } from "./CapTableToolbar";
import { useCreateStockClass } from "./useCreateStockClass";
import { useCreateShareholder } from "./useCreateShareholder";
import { useIssueStockWrite } from "./useIssueStockWrite";
import { useTransferStockWrite } from "./useTransferStockWrite";
import { Holdings } from "./Holdings";
import { Shareholders } from "./Shareholders";
import { StockClasses } from "./StockClasses";
import { IssueStock } from "./IssueStock";
import { Transfer } from "./Transfer";
import { Transactions } from "./Transactions";

/**
 * Company workspace shell. Left-nav screens are sibling modules named after
 * the COMPANY section: Holdings, Stock classes, Shareholders, Issue stock,
 * Transfer, Transactions.
 */
export function CapTableDashboard({ issuerResult, onReset }: CapTableDashboardProps) {
	const router = useRouter();
	const currentView: CapTableView = parseCapTableView(router.query.view as string | undefined);

	const [successModal, setSuccessModal] = useState<SuccessModalState | null>(null);
	const [historicalTransactions, setHistoricalTransactions] = useState<any[]>([]);
	const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [syncNote, setSyncNote] = useState<string | null>(null);
	const [addingShareholder, setAddingShareholder] = useState(false);
	const [addingStockClass, setAddingStockClass] = useState(false);
	const [hasPendingSyncFlag, setHasPendingSyncFlag] = useState(false);

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

	const writeHost = {
		issuerId: issuerResult._id,
		capTableAddress,
		refreshHoldings: manager.refreshHoldings,
		setSuccessModal,
		setActivityLog,
	};
	const stockClassWrite = useCreateStockClass(writeHost);
	const shareholderWrite = useCreateShareholder(writeHost);
	const issueWrite = useIssueStockWrite({
		...writeHost,
		holdings: manager.holdings,
		sessionClasses: stockClassWrite.directStockClasses,
		sessionPeople: shareholderWrite.directStakeholders,
	});
	const transferWrite = useTransferStockWrite({
		...writeHost,
		holdings: manager.holdings,
		sessionClasses: stockClassWrite.directStockClasses,
		sessionPeople: shareholderWrite.directStakeholders,
	});

	useEffect(() => {
		if (!effectiveIssuer?._id) return;
		setActivityLog(loadActivity(effectiveIssuer._id));
	}, [effectiveIssuer?._id]);

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
	}, [effectiveIssuer?._id]);

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
	}, [currentView, loadHistory, issueWrite.directIssuances.length]);

	const stockClassOptions = useMemo(() => {
		const fromHoldings = manager.holdings?.stockClasses || [];
		return dedupeById([...fromHoldings, ...stockClassWrite.directStockClasses]);
	}, [manager.holdings?.stockClasses, stockClassWrite.directStockClasses]);

	const issuableStockClasses = useMemo(() => {
		return stockClassOptions.filter((sc: any) => {
			if (sc.onchain) return true;
			if (sc.is_onchain_synced === true) return true;
			const session = stockClassWrite.directStockClasses.find((d) => d._id === sc._id);
			if (session) return !!session.onchain;
			if (sc.is_onchain_synced === false) return false;
			return true;
		});
	}, [stockClassOptions, stockClassWrite.directStockClasses]);

	const stakeholderOptions = useMemo(() => {
		const fromServer = manager.holdings?.stakeholders || [];
		const fromHoldings = (manager.holdings?.holdings || [])
			.map((h: { stakeholder?: any }) => h.stakeholder)
			.filter(Boolean);
		return dedupeById([...fromServer, ...fromHoldings, ...shareholderWrite.directStakeholders]);
	}, [manager.holdings?.stakeholders, manager.holdings?.holdings, shareholderWrite.directStakeholders]);

	const syncedHoldingKeys = new Set(
		(manager.holdings?.holdings || []).map(
			(h: any) => `${h.stakeholder?._id}|${h.stockClass?._id}`,
		),
	);
	const hasPendingSync =
		stockClassWrite.pendingStockClass ||
		shareholderWrite.pendingStakeholder ||
		issueWrite.pendingIssuance ||
		transferWrite.pendingTransfer ||
		issueWrite.directIssuances.some((iss) => issuanceStillSyncing(iss, syncedHoldingKeys));

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

	const onchainClassCount = issuableStockClasses.length;
	const peopleCount = stakeholderOptions.length;
	const positionCount =
		(manager.holdings?.holdings || []).length +
		issueWrite.directIssuances.filter((i) => i.confirmed || i.txHash).length;
	const ghostClassCount = stockClassOptions.length - onchainClassCount;

	const holdingsEmptyHint =
		positionCount === 0 && issueWrite.directIssuances.length === 0
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
			createdStockClasses={stockClassWrite.directStockClasses}
			createdStakeholders={shareholderWrite.directStakeholders}
			createdIssuances={issueWrite.directIssuances}
			isLoading={manager.isLoadingHoldings}
			error={manager.holdingsError}
			emptyHint={holdingsEmptyHint}
		/>
	);

	let main: ReactNode;
	if (currentView === "stock-classes") {
		main = (
			<StockClasses
				stockClasses={stockClassOptions}
				sessionClasses={stockClassWrite.directStockClasses}
				activityLog={activityLog}
				ghostClassCount={ghostClassCount}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				adding={addingStockClass}
				onAddingChange={setAddingStockClass}
				onSubmit={stockClassWrite.handleStockClass}
				toolbar={toolbar}
				holdings={manager.holdings?.holdings || []}
			/>
		);
	} else if (currentView === "stakeholders") {
		main = (
			<Shareholders
				stakeholders={stakeholderOptions}
				activityLog={activityLog}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				holdings={manager.holdings?.holdings || []}
				adding={addingShareholder}
				onAddingChange={setAddingShareholder}
				onSubmit={shareholderWrite.handleStakeholder}
				toolbar={toolbar}
			/>
		);
	} else if (currentView === "issue-stock") {
		main = (
			<IssueStock
				stockClasses={issuableStockClasses}
				stakeholders={stakeholderOptions}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				onSubmit={issueWrite.handleIssuance}
				toolbar={toolbar}
			/>
		);
	} else if (currentView === "transfer-stock") {
		main = (
			<Transfer
				stakeholders={stakeholderOptions}
				stockClasses={stockClassOptions}
				holdings={manager.holdings?.holdings || []}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				onSubmit={transferWrite.handleTransfer}
				toolbar={toolbar}
			/>
		);
	} else if (currentView === "transactions") {
		main = (
			<Transactions
				activityLog={activityLog}
				historicalTransactions={historicalTransactions}
				isLoadingHistory={isLoadingHistory}
				syncNote={syncNote}
				toolbar={toolbar}
			/>
		);
	} else {
		main = (
			<Holdings
				positionCount={positionCount}
				peopleCount={peopleCount}
				onchainClassCount={onchainClassCount}
				ghostClassCount={ghostClassCount}
				hasPendingSync={hasPendingSync}
				isLoading={manager.isLoadingHoldings}
				syncNote={syncNote}
				toolbar={toolbar}
				holdingsTable={holdingsTable}
				holdingsData={manager.holdings}
				createdIssuances={issueWrite.directIssuances}
				onNavigate={goTo}
			/>
		);
	}

	return (
		<Stack $gap="lg" data-testid="cap-table-dashboard">
			<IssuerHeader
				issuer={{
					...effectiveIssuer,
					deployed_to: capTableAddress || effectiveIssuer.deployed_to,
				}}
				contractAddress={capTableAddress || manager.contractAddress}
				onReset={onReset}
			/>
			{manager.holdingsError && (
				<StatusMessage $variant="error">
					{copy.errors.holdingsHttp(manager.holdingsError)}
				</StatusMessage>
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
		</Stack>
	);
}
