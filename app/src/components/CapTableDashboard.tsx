import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
	FullScreenStack,
	SectionHeader,
	StatusBox,
	StyledTable,
	TableScroll,
	TableTitle,
	MutedText,
	PageLayout,
	FormBand,
	DataBand,
	SectionActions,
} from "./wrappers";
import { InlineButton } from "./buttons";
import { IssuerHeader } from "./IssuerHeader";
import { StockClassForm } from "./StockClassForm";
import { StakeholderForm } from "./StakeholderForm";
import { IssueStockForm } from "./IssueStockForm";
import { HoldingsTable } from "./HoldingsTable";
import { TxSuccessModal } from "./TxSuccessModal";
import { useCapTableManager } from "../hooks/useCapTableManager";
import { useDirectCreateStockClass } from "../hooks/useDirectCreateStockClass";
import { useDirectCreateStakeholder } from "../hooks/useDirectCreateStakeholder";
import { useDirectIssueStock } from "../hooks/useDirectIssueStock";
import { bytes16ToUuid, generateBytes16Id } from "../utils/uuid";
import { validateShareCaps } from "@tap/units";
import { fetchHistoricalTransactions } from "../services/fetchHistoricalTransactions";
import { registerStockClassOnchain, type StockClassData } from "../services/createStockClass";
import { registerStakeholderOnchain, type StakeholderData } from "../services/createStakeholder";
import { registerStockIssuanceOnchain, type StockIssuanceData } from "../services/createStockIssuance";
import type { IssuerResponse } from "../services/registerIssuer";
import { copy } from "../lib/copy";
import { parseCapTableView, type CapTableView } from "./navConfig";
import { issuanceStillSyncing } from "../utils/holdingStatus";

interface CapTableDashboardProps {
	issuerResult: IssuerResponse;
	onReset: () => void;
}

interface OptimisticStockClass {
	_id: string;
	name: string;
	class_type: string;
	initial_shares_authorized?: string;
}
interface OptimisticStakeholder {
	_id: string;
	name: any;
	stakeholder_type: string;
}
interface OptimisticIssuance {
	_id: string;
	security_id: string;
	quantity: string;
	stakeholder_id: string;
	stock_class_id: string;
	share_price?: { amount: string; currency: string };
	stakeholder_name?: string;
	stock_class_name?: string;
	custom_id?: string;
	txHash?: string;
	/** Wallet receipt status === success */
	confirmed?: boolean;
	date?: string;
}

export function CapTableDashboard({ issuerResult, onReset }: CapTableDashboardProps) {
	const router = useRouter();
	const currentView: CapTableView = parseCapTableView(router.query.view as string | undefined);

	const directStockClass = useDirectCreateStockClass();
	const directStakeholder = useDirectCreateStakeholder();
	const directIssuance = useDirectIssueStock();

	const capTableAddress = issuerResult.deployed_to as `0x${string}` | undefined;

	const [directStockClasses, setDirectStockClasses] = useState<OptimisticStockClass[]>([]);
	const [directStakeholders, setDirectStakeholders] = useState<OptimisticStakeholder[]>([]);
	const [directIssuances, setDirectIssuances] = useState<OptimisticIssuance[]>([]);

	const [pendingStockClass, setPendingStockClass] = useState(false);
	const [pendingStakeholder, setPendingStakeholder] = useState(false);
	const [pendingIssuance, setPendingIssuance] = useState(false);

	const [successModal, setSuccessModal] = useState<{ title: string; txHash?: string; message?: string } | null>(
		null,
	);

	const [historicalTransactions, setHistoricalTransactions] = useState<any[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [isSyncingPoller, setIsSyncingPoller] = useState(false);
	const [syncNote, setSyncNote] = useState<string | null>(null);

	const [hasPendingSyncFlag, setHasPendingSyncFlag] = useState(false);
	const manager = useCapTableManager(issuerResult, { shouldPoll: hasPendingSyncFlag });

	// Confirm / revert handlers
	useEffect(() => {
		if (!pendingStockClass) return;
		if (directStockClass.isConfirmed) {
			setSuccessModal({
				title: copy.tx.confirmedTitle.stockClass,
				txHash: directStockClass.hash,
			});
			setPendingStockClass(false);
			directStockClass.reset();
		} else if (directStockClass.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directStockClass.errorMessage || copy.tx.revertedGeneric,
			});
			setDirectStockClasses((prev) => prev.slice(0, -1));
			setPendingStockClass(false);
			directStockClass.reset();
		}
	}, [directStockClass.isConfirmed, directStockClass.isReverted, directStockClass.hash, pendingStockClass, directStockClass]);

	useEffect(() => {
		if (!pendingStakeholder) return;
		if (directStakeholder.isConfirmed) {
			setSuccessModal({
				title: copy.tx.confirmedTitle.stakeholder,
				txHash: directStakeholder.hash,
			});
			setPendingStakeholder(false);
			directStakeholder.reset();
		} else if (directStakeholder.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directStakeholder.errorMessage || copy.tx.revertedGeneric,
			});
			setDirectStakeholders((prev) => prev.slice(0, -1));
			setPendingStakeholder(false);
			directStakeholder.reset();
		}
	}, [directStakeholder.isConfirmed, directStakeholder.isReverted, directStakeholder.hash, pendingStakeholder, directStakeholder]);

	useEffect(() => {
		if (!pendingIssuance) return;
		if (directIssuance.isConfirmed) {
			setSuccessModal({
				title: copy.tx.confirmedTitle.issuance,
				txHash: directIssuance.hash,
			});
			// Mark session row Confirmed as soon as the receipt succeeds
			setDirectIssuances((prev) => {
				if (!prev.length) return prev;
				const next = [...prev];
				next[next.length - 1] = {
					...next[next.length - 1],
					txHash: directIssuance.hash || next[next.length - 1].txHash,
					confirmed: true,
				};
				return next;
			});
			setPendingIssuance(false);
			directIssuance.reset();
			manager.refreshHoldings();
			// Poll chain holdings briefly so the Confirmed row can flip to the API row
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
			setDirectIssuances((prev) => prev.slice(0, -1));
			setPendingIssuance(false);
			directIssuance.reset();
		}
	}, [directIssuance.isConfirmed, directIssuance.isReverted, directIssuance.hash, pendingIssuance, directIssuance, manager]);

	const loadHistory = useCallback(() => {
		if (!issuerResult?._id) return;
		setIsLoadingHistory(true);
		fetchHistoricalTransactions(issuerResult._id)
			.then((res: any) => {
				const list = Array.isArray(res) ? res : Array.isArray(res?.transactions) ? res.transactions : [];
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

	const dedupeById = (items: any[]) => {
		const byId = new Map(items.filter(Boolean).map((x: any) => [x._id, x]));
		return Array.from(byId.values());
	};

	const stockClassOptions = useMemo(() => {
		const fromHoldings = manager.holdings?.stockClasses || [];
		return dedupeById([...fromHoldings, ...directStockClasses]);
	}, [manager.holdings?.stockClasses, directStockClasses]);

	const stakeholderOptions = useMemo(() => {
		const fromServer = manager.holdings?.stakeholders || [];
		const fromHoldings = (manager.holdings?.holdings || [])
			.map((h: { stakeholder?: any }) => h.stakeholder)
			.filter(Boolean);
		return dedupeById([...fromServer, ...fromHoldings, ...directStakeholders]);
	}, [manager.holdings?.stakeholders, manager.holdings?.holdings, directStakeholders]);

	const syncedStockClassIds = new Set((manager.holdings?.stockClasses || []).map((s: any) => s._id));
	const syncedStakeholderIds = new Set((manager.holdings?.stakeholders || []).map((s: any) => s._id));
	const syncedHoldingKeys = new Set(
		(manager.holdings?.holdings || []).map((h: any) => `${h.stakeholder?._id}|${h.stockClass?._id}`),
	);
	// "syncing…" only while a wallet receipt is still outstanding — not forever after confirm
	const hasPendingSync =
		pendingStockClass ||
		pendingStakeholder ||
		pendingIssuance ||
		directIssuances.some((iss) => issuanceStillSyncing(iss, syncedHoldingKeys));

	useEffect(() => {
		setHasPendingSyncFlag(hasPendingSync);
	}, [hasPendingSync]);

	const syncBlockchain = async () => {
		setIsSyncingPoller(true);
		setSyncNote(null);
		try {
			// buffer: 0 → jump poller index to chain head now (no sequential re-scan)
			const res = await fetch(`/api/issuer/poller-catchup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ issuerId: issuerResult._id, buffer: 0 }),
			});
			const text = await res.text();
			let json: any = null;
			try {
				json = JSON.parse(text);
			} catch {
				const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
				setSyncNote(plain.slice(0, 200) || `Sync failed (${res.status})`);
				return;
			}
			if (!res.ok) {
				setSyncNote(json?.error || json?.message || `Sync failed (${res.status})`);
				return;
			}
			// Holdings read the chain directly — refresh immediately, don't wait on poller
			await Promise.all([manager.refreshHoldings(), Promise.resolve(loadHistory())]);
			setSyncNote(json.message || `Synced to block ${json.head ?? "head"}.`);
		} catch (e) {
			setSyncNote(e instanceof Error ? e.message : "Sync failed");
		} finally {
			setIsSyncingPoller(false);
		}
	};

	const handleStockClass = async (data: StockClassData) => {
		if (!capTableAddress || !directStockClass.isConnected) {
			setSuccessModal({ title: "Wallet required", message: copy.tx.walletRequired });
			return;
		}
		try {
			const stockClassBytes16 = generateBytes16Id() as `0x${string}`;
			const stockClassUuid = bytes16ToUuid(stockClassBytes16);

			await directStockClass.createStockClass({
				capTableAddress,
				classType: data.class_type,
				pricePerShareAmount: data.price_per_share?.amount || "0",
				initialSharesAuthorized: data.initial_shares_authorized,
				id: stockClassBytes16,
			});

			setPendingStockClass(true);
			setDirectStockClasses((prev) => [
				...prev,
				{
					_id: stockClassUuid,
					name: data.name,
					class_type: data.class_type,
					initial_shares_authorized: data.initial_shares_authorized,
				},
			]);

			registerStockClassOnchain({ issuerId: issuerResult._id, data, id: stockClassUuid }).catch((err) =>
				console.warn("Failed to register stock class metadata:", err),
			);
			manager.refreshHoldings();
		} catch (err) {
			setSuccessModal({
				title: "Transaction failed",
				message: err instanceof Error ? err.message : "Failed to create share class.",
			});
		}
	};

	const handleStakeholder = async (data: StakeholderData) => {
		if (!capTableAddress || !directStakeholder.isConnected) {
			setSuccessModal({ title: "Wallet required", message: copy.tx.walletRequired });
			return;
		}
		try {
			const stakeholderBytes16 = generateBytes16Id() as `0x${string}`;
			const stakeholderUuid = bytes16ToUuid(stakeholderBytes16);

			await directStakeholder.createStakeholder({
				capTableAddress,
				stakeholderType: data.stakeholder_type,
				currentRelationship: data.current_relationship,
				id: stakeholderBytes16,
			});

			setPendingStakeholder(true);
			setDirectStakeholders((prev) => [
				...prev,
				{ _id: stakeholderUuid, name: data.name, stakeholder_type: data.stakeholder_type },
			]);

			registerStakeholderOnchain({ issuerId: issuerResult._id, data, id: stakeholderUuid }).catch((err) =>
				console.warn("Failed to register stakeholder metadata:", err),
			);
			manager.refreshHoldings();
		} catch (err) {
			setSuccessModal({
				title: "Transaction failed",
				message: err instanceof Error ? err.message : "Failed to add person.",
			});
		}
	};

	const handleIssuance = async (data: StockIssuanceData) => {
		if (!capTableAddress || !directIssuance.isConnected) {
			setSuccessModal({ title: "Wallet required", message: copy.tx.walletRequired });
			return;
		}

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
			// Guard: class must exist onchain (Mongo can have metadata-only rows)
			if (stockClass && stockClass.is_onchain_synced === false) {
				setSuccessModal({
					title: "Share class not onchain",
					message:
						"This share class is only saved as metadata. Create it again under Classes and wait for the wallet confirmation before issuing.",
				});
				return;
			}

			const result = await directIssuance.issueStock({
				capTableAddress,
				stakeholderId: data.stakeholder_id,
				stockClassId: data.stock_class_id,
				quantity: data.quantity,
				sharePriceAmount: data.share_price?.amount || "0",
				customId: data.custom_id,
				comments: data.comments,
			});

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
					stakeholder_name: stakeholder?.name?.legal_name || stakeholder?.name?.first_name,
					stock_class_name: stockClass?.name,
					custom_id: data.custom_id,
					txHash: result.hash,
					date: new Date().toISOString().slice(0, 10),
				},
			]);

			registerStockIssuanceOnchain({ issuerId: issuerResult._id, data }).catch((err) =>
				console.warn("Failed to register stock issuance metadata:", err),
			);
			manager.refreshHoldings();
		} catch (err) {
			setSuccessModal({
				title: "Transaction failed",
				message: err instanceof Error ? err.message : "Failed to issue stock.",
			});
		}
	};

	// Parent toolbar owns Refresh — don't pass onRefresh (avoids double buttons)
	const holdingsTable = (
		<HoldingsTable
			holdingsData={manager.holdings}
			createdStockClasses={directStockClasses}
			createdStakeholders={directStakeholders}
			createdIssuances={directIssuances}
			isLoading={manager.isLoadingHoldings}
			error={manager.holdingsError}
			compact
		/>
	);

	const toolBar = (
		<SectionActions>
			<InlineButton onClick={syncBlockchain} disabled={isSyncingPoller} $variant="secondary">
				{isSyncingPoller ? "Syncing…" : "Sync blockchain"}
			</InlineButton>
			<InlineButton
				onClick={() => {
					manager.refreshHoldings();
					loadHistory();
				}}
				disabled={manager.isLoadingHoldings || isLoadingHistory}
				$variant="ghost"
			>
				{manager.isLoadingHoldings ? "Refreshing…" : "Refresh"}
			</InlineButton>
		</SectionActions>
	);

	const renderMainContent = () => {
		if (currentView === "stock-classes") {
			return (
				<PageLayout data-testid="view-stock-classes">
					<FormBand>
						<TableTitle>New share class</TableTitle>
						<StockClassForm onSubmit={handleStockClass} disabled={manager.isLoadingHoldings} />
					</FormBand>
					<DataBand>
						<SectionHeader>
							<TableTitle>Share classes</TableTitle>
							{toolBar}
						</SectionHeader>
						<TableScroll>
							<StyledTable>
								<thead>
									<tr>
										<th>Name</th>
										<th>Type</th>
										<th>Authorized</th>
										<th>ID</th>
									</tr>
								</thead>
								<tbody>
									{stockClassOptions.length === 0 ? (
										<tr>
											<td colSpan={4}>
												<MutedText>None yet — use the form above.</MutedText>
											</td>
										</tr>
									) : (
										stockClassOptions.map((sc: any) => (
											<tr key={sc._id}>
												<td>{sc.name || "—"}</td>
												<td>{sc.class_type || "—"}</td>
												<td>{sc.initial_shares_authorized ?? sc.shares_authorized ?? "—"}</td>
												<td style={{ wordBreak: "break-all", fontSize: "0.85em" }}>{sc._id}</td>
											</tr>
										))
									)}
								</tbody>
							</StyledTable>
						</TableScroll>
					</DataBand>
				</PageLayout>
			);
		}

		if (currentView === "stakeholders") {
			return (
				<PageLayout data-testid="view-stakeholders">
					<FormBand>
						<TableTitle>Add person</TableTitle>
						<StakeholderForm onSubmit={handleStakeholder} disabled={manager.isLoadingHoldings} />
					</FormBand>
					<DataBand>
						<SectionHeader>
							<TableTitle>People</TableTitle>
							{toolBar}
						</SectionHeader>
						<TableScroll>
							<StyledTable>
								<thead>
									<tr>
										<th>Name</th>
										<th>Type</th>
										<th>ID</th>
									</tr>
								</thead>
								<tbody>
									{stakeholderOptions.length === 0 ? (
										<tr>
											<td colSpan={3}>
												<MutedText>None yet — use the form above.</MutedText>
											</td>
										</tr>
									) : (
										stakeholderOptions.map((sh: any) => (
											<tr key={sh._id}>
												<td>{sh.name?.legal_name || sh.name?.first_name || "—"}</td>
												<td>{sh.stakeholder_type || "—"}</td>
												<td style={{ wordBreak: "break-all", fontSize: "0.85em" }}>{sh._id}</td>
											</tr>
										))
									)}
								</tbody>
							</StyledTable>
						</TableScroll>
					</DataBand>
				</PageLayout>
			);
		}

		if (currentView === "issue-stock") {
			return (
				<PageLayout data-testid="view-issue-stock">
					<FormBand>
						<TableTitle>Issue stock</TableTitle>
						<IssueStockForm
							stockClasses={stockClassOptions}
							stakeholders={stakeholderOptions}
							onSubmit={handleIssuance}
							disabled={
								manager.isLoadingHoldings ||
								stockClassOptions.length === 0 ||
								stakeholderOptions.length === 0
							}
							hint={
								!manager.isLoadingHoldings &&
								(stockClassOptions.length === 0 || stakeholderOptions.length === 0)
									? copy.issueStock.needsSetup
									: undefined
							}
						/>
					</FormBand>
					<DataBand>
						<SectionHeader>
							<TableTitle>Holdings</TableTitle>
							{toolBar}
						</SectionHeader>
						{holdingsTable}
					</DataBand>
				</PageLayout>
			);
		}

		if (currentView === "transactions") {
			const pendingRows = directIssuances.map((iss) => ({
				type: "Stock issuance",
				details: iss.custom_id || iss.security_id || "—",
				quantity: iss.quantity,
				price: iss.share_price?.amount
					? `${iss.share_price.amount} ${iss.share_price.currency || "USD"}`
					: "—",
				date: iss.date || "—",
				status: "Pending",
				key: `local-${iss._id}`,
			}));

			const historyRows = historicalTransactions.map((tx: any, idx: number) => {
				const t = tx.transaction || tx || {};
				const priceAmount = t.share_price?.amount;
				return {
					type: tx.transactionType || t.object_type || "Transaction",
					details: t.custom_id || t.security_id || "—",
					quantity: t.quantity ?? "—",
					price:
						priceAmount != null && priceAmount !== ""
							? `${priceAmount} ${t.share_price?.currency || "USD"}`
							: "—",
					date: t.date || "—",
					status: "Confirmed",
					key: `hist-${idx}`,
				};
			});

			const rows = [...pendingRows, ...historyRows];

			return (
				<PageLayout data-testid="view-transactions">
					<DataBand>
						<SectionHeader>
							<TableTitle>Activity</TableTitle>
							{toolBar}
						</SectionHeader>
						{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
						<TableScroll>
							<StyledTable>
								<thead>
									<tr>
										<th>Type</th>
										<th>Details</th>
										<th>Shares</th>
										<th>Price</th>
										<th>Date</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{rows.length === 0 ? (
										<tr>
											<td colSpan={6}>
												<MutedText>
													{isLoadingHistory
														? "Loading…"
														: "No activity yet. Issue stock, then Sync blockchain if history is empty."}
												</MutedText>
											</td>
										</tr>
									) : (
										rows.map((r) => (
											<tr key={r.key}>
												<td>{r.type}</td>
												<td style={{ wordBreak: "break-all" }}>{r.details}</td>
												<td>{r.quantity}</td>
												<td>{r.price}</td>
												<td>{r.date}</td>
												<td>{r.status}</td>
											</tr>
										))
									)}
								</tbody>
							</StyledTable>
						</TableScroll>
					</DataBand>
				</PageLayout>
			);
		}

		// overview — holdings first, compact counts
		const classN = stockClassOptions.length;
		const peopleN = stakeholderOptions.length;
		const posN = (manager.holdings?.holdings || []).length + directIssuances.length;

		return (
			<PageLayout data-testid="view-overview">
				<DataBand>
					<SectionHeader>
						<div>
							<TableTitle>Holdings</TableTitle>
							<MutedText style={{ marginTop: "0.35rem" }}>
								{classN} class{classN === 1 ? "" : "es"} · {peopleN} people · {posN} position
								{posN === 1 ? "" : "s"}
								{hasPendingSync ? " · syncing…" : ""}
							</MutedText>
						</div>
						{toolBar}
					</SectionHeader>
					{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
					{holdingsTable}
				</DataBand>
			</PageLayout>
		);
	};

	return (
		<FullScreenStack data-testid="cap-table-dashboard">
			<IssuerHeader issuer={issuerResult} contractAddress={manager.contractAddress} onReset={onReset} />

			{manager.holdingsError && <StatusBox $variant="error">{manager.holdingsError}</StatusBox>}

			{renderMainContent()}

			<TxSuccessModal
				isOpen={!!successModal}
				onClose={() => setSuccessModal(null)}
				title={successModal?.title || ""}
				txHash={successModal?.txHash}
				message={successModal?.message}
			/>
		</FullScreenStack>
	);
}
