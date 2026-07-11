import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
	ActionTableLayout,
	FullScreenStack,
	Panel,
	SectionHeader,
	StatusBox,
	StyledTable,
	TablePanel,
	TableScroll,
	TableTitle,
	MutedText,
} from "./wrappers";
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

interface CapTableDashboardProps {
	issuerResult: IssuerResponse;
	onReset: () => void;
}

interface PendingModal {
	title: string;
	message?: string;
	kind: "stockClass" | "stakeholder" | "issuance";
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

	// Pending until receipt is confirmed or reverted — never "success on submit".
	const [pendingStockClass, setPendingStockClass] = useState<PendingModal | null>(null);
	const [pendingStakeholder, setPendingStakeholder] = useState<PendingModal | null>(null);
	const [pendingIssuance, setPendingIssuance] = useState<PendingModal | null>(null);

	const [successModal, setSuccessModal] = useState<{ title: string; txHash?: string; message?: string } | null>(null);

	const [historicalTransactions, setHistoricalTransactions] = useState<any[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);

	// Compute pending sync for holdings polling *before* manager so we can pass shouldPoll.
	const [hasPendingSyncFlag, setHasPendingSyncFlag] = useState(false);

	const manager = useCapTableManager(issuerResult, { shouldPoll: hasPendingSyncFlag });

	useEffect(() => {
		if (!pendingStockClass) return;
		if (directStockClass.isConfirmed) {
			setSuccessModal({
				title: copy.tx.confirmedTitle.stockClass,
				txHash: directStockClass.hash,
				message: pendingStockClass.message,
			});
			setPendingStockClass(null);
			directStockClass.reset();
		} else if (directStockClass.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directStockClass.errorMessage || copy.tx.revertedGeneric,
			});
			setDirectStockClasses((prev) => prev.slice(0, -1));
			setPendingStockClass(null);
			directStockClass.reset();
		}
	}, [directStockClass.isConfirmed, directStockClass.isReverted, directStockClass.hash, pendingStockClass, directStockClass]);

	useEffect(() => {
		if (!pendingStakeholder) return;
		if (directStakeholder.isConfirmed) {
			setSuccessModal({
				title: copy.tx.confirmedTitle.stakeholder,
				txHash: directStakeholder.hash,
				message: pendingStakeholder.message,
			});
			setPendingStakeholder(null);
			directStakeholder.reset();
		} else if (directStakeholder.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directStakeholder.errorMessage || copy.tx.revertedGeneric,
			});
			setDirectStakeholders((prev) => prev.slice(0, -1));
			setPendingStakeholder(null);
			directStakeholder.reset();
		}
	}, [directStakeholder.isConfirmed, directStakeholder.isReverted, directStakeholder.hash, pendingStakeholder, directStakeholder]);

	useEffect(() => {
		if (!pendingIssuance) return;
		if (directIssuance.isConfirmed) {
			setSuccessModal({
				title: copy.tx.confirmedTitle.issuance,
				txHash: directIssuance.hash,
				message: pendingIssuance.message,
			});
			setPendingIssuance(null);
			directIssuance.reset();
		} else if (directIssuance.isReverted) {
			setSuccessModal({
				title: copy.tx.revertedTitle,
				message: directIssuance.errorMessage || copy.tx.issuanceReverted,
			});
			setDirectIssuances((prev) => prev.slice(0, -1));
			setPendingIssuance(null);
			directIssuance.reset();
		}
	}, [directIssuance.isConfirmed, directIssuance.isReverted, directIssuance.hash, pendingIssuance, directIssuance]);

	useEffect(() => {
		if (currentView !== "transactions" || !issuerResult?._id) return;
		setIsLoadingHistory(true);
		fetchHistoricalTransactions(issuerResult._id)
			.then((res: any) => setHistoricalTransactions(Array.isArray(res?.transactions) ? res.transactions : res || []))
			.catch((err) => console.warn("Failed to load historical transactions", err))
			.finally(() => setIsLoadingHistory(false));
	}, [currentView, issuerResult?._id]);

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
		const fromHoldings = (manager.holdings?.holdings || []).map((h: { stakeholder?: any }) => h.stakeholder).filter(Boolean);
		return dedupeById([...fromServer, ...fromHoldings, ...directStakeholders]);
	}, [manager.holdings?.stakeholders, manager.holdings?.holdings, directStakeholders]);

	const syncedStockClassIds = new Set((manager.holdings?.stockClasses || []).map((s: any) => s._id));
	const syncedStakeholderIds = new Set((manager.holdings?.stakeholders || []).map((s: any) => s._id));
	const syncedHoldingKeys = new Set(
		(manager.holdings?.holdings || []).map((h: any) => `${h.stakeholder?._id}|${h.stockClass?._id}`),
	);
	const hasPendingSync =
		directStockClasses.some((sc) => !syncedStockClassIds.has(sc._id)) ||
		directStakeholders.some((sh) => !syncedStakeholderIds.has(sh._id)) ||
		directIssuances.some((iss) => !syncedHoldingKeys.has(`${iss.stakeholder_id}|${iss.stock_class_id}`));

	useEffect(() => {
		setHasPendingSyncFlag(hasPendingSync);
	}, [hasPendingSync]);

	const handleStockClass = async (data: StockClassData) => {
		if (!capTableAddress || !directStockClass.isConnected) {
			setSuccessModal({ title: "Wallet Required", message: copy.tx.walletRequired });
			return;
		}

		const issuerAuthorized = Number(manager.holdings?.issuer?.initial_shares_authorized ?? 0);
		const classAuth = Number(data.initial_shares_authorized);
		if (issuerAuthorized > 0 && Number.isFinite(classAuth) && classAuth > issuerAuthorized) {
			console.warn(
				`Stock class authorized (${classAuth}) exceeds issuer authorized (${issuerAuthorized}). Issuance remains bounded by the issuer total.`,
			);
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

			setPendingStockClass({
				kind: "stockClass",
				title: copy.tx.submittedTitle.stockClass,
				message: copy.tx.submittedBody,
			});

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
			console.error("Direct stock class creation failed", err);
			setSuccessModal({
				title: "Transaction Failed",
				message: err instanceof Error ? err.message : "Failed to create stock class onchain.",
			});
		}
	};

	const handleStakeholder = async (data: StakeholderData) => {
		if (!capTableAddress || !directStakeholder.isConnected) {
			setSuccessModal({ title: "Wallet Required", message: copy.tx.walletRequired });
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

			setPendingStakeholder({
				kind: "stakeholder",
				title: copy.tx.submittedTitle.stakeholder,
				message: copy.tx.submittedBody,
			});

			setDirectStakeholders((prev) => [
				...prev,
				{ _id: stakeholderUuid, name: data.name, stakeholder_type: data.stakeholder_type },
			]);

			registerStakeholderOnchain({ issuerId: issuerResult._id, data, id: stakeholderUuid }).catch((err) =>
				console.warn("Failed to register stakeholder metadata:", err),
			);

			manager.refreshHoldings();
		} catch (err) {
			console.error("Direct stakeholder creation failed", err);
			setSuccessModal({
				title: "Transaction Failed",
				message: err instanceof Error ? err.message : "Failed to create stakeholder onchain.",
			});
		}
	};

	const handleIssuance = async (data: StockIssuanceData) => {
		if (!capTableAddress || !directIssuance.isConnected) {
			setSuccessModal({ title: "Wallet Required", message: copy.tx.walletRequired });
			return;
		}

		const issuer = manager.holdings?.issuer;
		const stockClass =
			stockClassOptions.find((sc: any) => sc._id === data.stock_class_id) ||
			(manager.holdings?.stockClasses || []).find((sc: any) => sc._id === data.stock_class_id);

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
			setSuccessModal({
				title: "Not enough authorized shares",
				message: cap.errors.join(" "),
			});
			return;
		}

		try {
			const result = await directIssuance.issueStock({
				capTableAddress,
				stakeholderId: data.stakeholder_id,
				stockClassId: data.stock_class_id,
				quantity: data.quantity,
				sharePriceAmount: data.share_price?.amount || "0",
				customId: data.custom_id,
				comments: data.comments,
			});

			setPendingIssuance({
				kind: "issuance",
				title: copy.tx.submittedTitle.issuance,
				message: copy.tx.submittedBody,
			});

			setDirectIssuances((prev) => [
				...prev,
				{
					_id: result.issuanceId,
					security_id: result.securityId,
					quantity: data.quantity,
					stakeholder_id: data.stakeholder_id,
					stock_class_id: data.stock_class_id,
				},
			]);

			registerStockIssuanceOnchain({ issuerId: issuerResult._id, data }).catch((err) =>
				console.warn("Failed to register stock issuance metadata:", err),
			);

			manager.refreshHoldings();
		} catch (err) {
			console.error("Direct stock issuance failed", err);
			setSuccessModal({
				title: "Transaction Failed",
				message: err instanceof Error ? err.message : "Failed to issue stock onchain.",
			});
		}
	};

	const holdingsTable = (
		<HoldingsTable
			holdingsData={manager.holdings}
			createdStockClasses={directStockClasses}
			createdStakeholders={directStakeholders}
			createdIssuances={directIssuances}
			onRefresh={manager.refreshHoldings}
			isLoading={manager.isLoadingHoldings}
			error={manager.holdingsError}
		/>
	);

	const stockClassList =
		stockClassOptions.length > 0 ? (
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
						{stockClassOptions.map((sc: any) => (
							<tr key={sc._id}>
								<td>{sc.name || "—"}</td>
								<td>{sc.class_type || "—"}</td>
								<td>{sc.initial_shares_authorized ?? sc.shares_authorized ?? "—"}</td>
								<td style={{ fontFamily: "monospace", fontSize: "0.85em" }}>{sc._id?.slice?.(0, 8) || sc._id}</td>
							</tr>
						))}
					</tbody>
				</StyledTable>
			</TableScroll>
		) : (
			<MutedText>No stock classes yet. Create one with the form.</MutedText>
		);

	const stakeholderList =
		stakeholderOptions.length > 0 ? (
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
						{stakeholderOptions.map((sh: any) => (
							<tr key={sh._id}>
								<td>{sh.name?.legal_name || sh.name?.first_name || "—"}</td>
								<td>{sh.stakeholder_type || "—"}</td>
								<td style={{ fontFamily: "monospace", fontSize: "0.85em" }}>{sh._id?.slice?.(0, 8) || sh._id}</td>
							</tr>
						))}
					</tbody>
				</StyledTable>
			</TableScroll>
		) : (
			<MutedText>No stakeholders yet. Create one with the form.</MutedText>
		);

	const renderMainContent = () => {
		if (currentView === "stock-classes") {
			return (
				<ActionTableLayout data-testid="view-stock-classes">
					<Panel>
						<SectionHeader>
							<TableTitle>Create Stock Class</TableTitle>
						</SectionHeader>
						<MutedText>OCF StockClass — class of stock issued by the issuer.</MutedText>
						<StockClassForm onSubmit={handleStockClass} disabled={manager.isLoadingHoldings} />
					</Panel>
					<TablePanel>
						<SectionHeader>
							<TableTitle>Stock Classes</TableTitle>
						</SectionHeader>
						{stockClassList}
						{holdingsTable}
					</TablePanel>
				</ActionTableLayout>
			);
		}

		if (currentView === "stakeholders") {
			return (
				<ActionTableLayout data-testid="view-stakeholders">
					<Panel>
						<SectionHeader>
							<TableTitle>Create Stakeholder</TableTitle>
						</SectionHeader>
						<MutedText>OCF Stakeholder — individual or institution on the cap table.</MutedText>
						<StakeholderForm onSubmit={handleStakeholder} disabled={manager.isLoadingHoldings} />
					</Panel>
					<TablePanel>
						<SectionHeader>
							<TableTitle>Stakeholders</TableTitle>
						</SectionHeader>
						{stakeholderList}
						{holdingsTable}
					</TablePanel>
				</ActionTableLayout>
			);
		}

		if (currentView === "issue-stock") {
			return (
				<ActionTableLayout data-testid="view-issue-stock">
					<Panel>
						<SectionHeader>
							<TableTitle>Issue Stock</TableTitle>
						</SectionHeader>
						<MutedText>OCF TX_STOCK_ISSUANCE — mint shares to a stakeholder.</MutedText>
						<IssueStockForm
							stockClasses={stockClassOptions}
							stakeholders={stakeholderOptions}
							onSubmit={handleIssuance}
							disabled={manager.isLoadingHoldings || stockClassOptions.length === 0 || stakeholderOptions.length === 0}
							hint={
								!manager.isLoadingHoldings && (stockClassOptions.length === 0 || stakeholderOptions.length === 0)
									? copy.issueStock.needsSetup
									: undefined
							}
						/>
					</Panel>
					<TablePanel>{holdingsTable}</TablePanel>
				</ActionTableLayout>
			);
		}

		if (currentView === "transactions") {
			return (
				<div data-testid="view-transactions">
					<TablePanel>
						<SectionHeader>
							<TableTitle>Historical Transactions</TableTitle>
						</SectionHeader>
						{historicalTransactions.length > 0 ? (
							<TableScroll>
								<StyledTable>
									<thead>
										<tr>
											<th>Type</th>
											<th>Details</th>
											<th>Quantity</th>
											<th>Price</th>
											<th>Date</th>
										</tr>
									</thead>
									<tbody>
										{historicalTransactions.map((tx: any, idx: number) => {
											const t = tx.transaction || {};
											const priceAmount = t.share_price?.amount;
											const priceLabel =
												priceAmount != null && priceAmount !== ""
													? `${priceAmount} ${t.share_price?.currency || "USD"}`
													: "—";
											return (
												<tr key={idx}>
													<td>{tx.transactionType}</td>
													<td>{t.custom_id || t.security_id?.slice(0, 8) || "—"}</td>
													<td>{t.quantity}</td>
													<td>{priceLabel}</td>
													<td>{t.date || "—"}</td>
												</tr>
											);
										})}
									</tbody>
								</StyledTable>
							</TableScroll>
						) : (
							<div style={{ padding: "1rem", opacity: 0.6 }}>
								No historical transactions yet. Issue stock to see activity here.
								{isLoadingHistory && " (loading...)"}
							</div>
						)}

						{holdingsTable}
					</TablePanel>
				</div>
			);
		}

		// overview — holdings summary
		return (
			<div data-testid="view-overview">
				<ActionTableLayout>
					<Panel>
						<SectionHeader>
							<TableTitle>Issuer Overview</TableTitle>
						</SectionHeader>
						<MutedText>
							Active positions and entities on this OCF issuer. Use the left navigation to create
							stakeholders, stock classes, issue stock, or browse transactions.
						</MutedText>
						<MutedText>
							Stock classes: {stockClassOptions.length} · Stakeholders: {stakeholderOptions.length}
						</MutedText>
					</Panel>
					<TablePanel>{holdingsTable}</TablePanel>
				</ActionTableLayout>
			</div>
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
