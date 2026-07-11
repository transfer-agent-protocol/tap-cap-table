import { useEffect, useMemo, useState } from "react";
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
} from "./wrappers";
import { IssuerHeader } from "./IssuerHeader";
import { StockClassForm } from "./StockClassForm";
import { StakeholderForm } from "./StakeholderForm";
import { IssueStockForm } from "./IssueStockForm";
import { HoldingsTable } from "./HoldingsTable";
import { MintNavDrawer, type MintView } from "./MintNavDrawer";
import { TxSuccessModal } from "./TxSuccessModal";
import { useCapTableMenu } from "./CapTableMenuContext";
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
	const directStockClass = useDirectCreateStockClass();
	const directStakeholder = useDirectCreateStakeholder();
	const directIssuance = useDirectIssueStock();

	const capTableAddress = issuerResult.deployed_to as `0x${string}` | undefined;

	const [currentView, setCurrentView] = useState<MintView>("overview");
	const { isOpen: isDrawerOpen, setOpen: setIsDrawerOpen, setEnabled: setMenuEnabled } = useCapTableMenu();

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
	// (We recompute after manager for id matching — first pass uses optimistic lengths.)
	const [hasPendingSyncFlag, setHasPendingSyncFlag] = useState(false);

	const manager = useCapTableManager(issuerResult, { shouldPoll: hasPendingSyncFlag });

	useEffect(() => {
		setMenuEnabled(true);
		return () => {
			setMenuEnabled(false);
			setIsDrawerOpen(false);
		};
	}, [setMenuEnabled, setIsDrawerOpen]);

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
		if (currentView !== "activity" || !issuerResult?._id) return;
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
			// Creation is allowed onchain, but warn clearly (issuance will still be bounded by issuer).
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
			// Mongo issuer may not track shares_issued; sum holdings as a best-effort floor.
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

	const handleNavigate = (view: MintView) => {
		setCurrentView(view);
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

	const renderMainContent = () => {
		if (currentView === "stock-classes") {
			return (
				<ActionTableLayout>
					<Panel>
						<SectionHeader>
							<TableTitle>Create Stock Class</TableTitle>
						</SectionHeader>
						<StockClassForm onSubmit={handleStockClass} />
					</Panel>
					<TablePanel>{holdingsTable}</TablePanel>
				</ActionTableLayout>
			);
		}

		if (currentView === "stakeholders") {
			return (
				<ActionTableLayout>
					<Panel>
						<SectionHeader>
							<TableTitle>Create Stakeholder</TableTitle>
						</SectionHeader>
						<StakeholderForm onSubmit={handleStakeholder} />
					</Panel>
					<TablePanel>{holdingsTable}</TablePanel>
				</ActionTableLayout>
			);
		}

		if (currentView === "activity") {
			return (
				<TablePanel>
					<SectionHeader>
						<TableTitle>Recent Activity (Historical Transactions)</TableTitle>
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
										// Poller already unscales share_price.amount via toDecimal (1e10).
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
			);
		}

		return (
			<ActionTableLayout>
				<Panel>
					<StockClassForm onSubmit={handleStockClass} disabled={manager.isLoadingHoldings} />
					<StakeholderForm onSubmit={handleStakeholder} disabled={manager.isLoadingHoldings} />
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
	};

	return (
		<FullScreenStack>
			<IssuerHeader issuer={issuerResult} contractAddress={manager.contractAddress} onReset={onReset} />

			{manager.holdingsError && <StatusBox $variant="error">{manager.holdingsError}</StatusBox>}

			{renderMainContent()}

			<MintNavDrawer
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				currentView={currentView}
				onNavigate={handleNavigate}
				stockClasses={directStockClasses.map((sc) => ({
					_id: sc._id,
					name: sc.name,
				}))}
				stakeholders={directStakeholders.map((sh) => ({
					_id: sh._id,
					name: sh.name,
				}))}
			/>

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
