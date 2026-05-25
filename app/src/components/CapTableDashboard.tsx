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
import { fetchHistoricalTransactions } from "../services/fetchHistoricalTransactions";
import { registerStockClassOnchain, type StockClassData } from "../services/createStockClass";
import { registerStakeholderOnchain, type StakeholderData } from "../services/createStakeholder";
import { registerStockIssuanceOnchain, type StockIssuanceData } from "../services/createStockIssuance";
import type { IssuerResponse } from "../services/registerIssuer";

interface CapTableDashboardProps {
	issuerResult: IssuerResponse;
	onReset: () => void;
}

interface PendingModal {
	title: string;
	message?: string;
}

export function CapTableDashboard({ issuerResult, onReset }: CapTableDashboardProps) {
	const manager = useCapTableManager(issuerResult);
	const directStockClass = useDirectCreateStockClass();
	const directStakeholder = useDirectCreateStakeholder();
	const directIssuance = useDirectIssueStock();

	const capTableAddress = issuerResult.deployed_to as `0x${string}` | undefined;

	const [currentView, setCurrentView] = useState<MintView>("overview");
	const { isOpen: isDrawerOpen, setOpen: setIsDrawerOpen, setEnabled: setMenuEnabled } = useCapTableMenu();

	// Tell the navbar that the menu trigger is meaningful while this dashboard
	// is mounted; clean up so other routes don't render the trigger.
	useEffect(() => {
		setMenuEnabled(true);
		return () => {
			setMenuEnabled(false);
			setIsDrawerOpen(false);
		};
	}, [setMenuEnabled, setIsDrawerOpen]);

	// Local optimistic state for items created via direct wallet signing in this session.
	interface OptimisticStockClass { _id: string; name: string; class_type: string; }
	interface OptimisticStakeholder { _id: string; name: any; stakeholder_type: string; }
	interface OptimisticIssuance {
		_id: string;
		security_id: string;
		quantity: string;
		stakeholder_id: string;
		stock_class_id: string;
	}

	const [directStockClasses, setDirectStockClasses] = useState<OptimisticStockClass[]>([]);
	const [directStakeholders, setDirectStakeholders] = useState<OptimisticStakeholder[]>([]);
	const [directIssuances, setDirectIssuances] = useState<OptimisticIssuance[]>([]);

	// Pending success modals: filled in on submit; the txHash is patched in via useEffect once
	// the wagmi hook surfaces it. writeContract returns synchronously but `hash` populates async.
	const [pendingStockClass, setPendingStockClass] = useState<PendingModal | null>(null);
	const [pendingStakeholder, setPendingStakeholder] = useState<PendingModal | null>(null);
	const [pendingIssuance, setPendingIssuance] = useState<PendingModal | null>(null);

	const [successModal, setSuccessModal] = useState<{ title: string; txHash?: string; message?: string } | null>(null);

	// Historical transactions for the Activity view (poller-populated)
	const [historicalTransactions, setHistoricalTransactions] = useState<any[]>([]); // TODO: proper HistoricalTransaction type
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);

	// When the direct hooks finally surface a hash, open the corresponding success modal.
	// These effects exist because wagmi's writeContract is async — the `hash` field on the hook
	// becomes defined a tick after the function call returns, so reading it inside the submit
	// handler always gets undefined.
	useEffect(() => {
		if (directStockClass.hash && pendingStockClass) {
			setSuccessModal({ ...pendingStockClass, txHash: directStockClass.hash });
			setPendingStockClass(null);
			directStockClass.reset();
		}
	}, [directStockClass.hash, pendingStockClass, directStockClass]);

	useEffect(() => {
		if (directStakeholder.hash && pendingStakeholder) {
			setSuccessModal({ ...pendingStakeholder, txHash: directStakeholder.hash });
			setPendingStakeholder(null);
			directStakeholder.reset();
		}
	}, [directStakeholder.hash, pendingStakeholder, directStakeholder]);

	useEffect(() => {
		if (directIssuance.hash && pendingIssuance) {
			setSuccessModal({ ...pendingIssuance, txHash: directIssuance.hash });
			setPendingIssuance(null);
			directIssuance.reset();
		}
	}, [directIssuance.hash, pendingIssuance, directIssuance]);

	// Lazy-load historical transactions when the Activity view is opened.
	useEffect(() => {
		if (currentView !== "activity" || !issuerResult?._id) return;
		setIsLoadingHistory(true);
		fetchHistoricalTransactions(issuerResult._id)
			.then((res: any) => setHistoricalTransactions(Array.isArray(res?.transactions) ? res.transactions : res || [])) // TODO: proper type
			.catch((err) => console.warn("Failed to load historical transactions", err))
			.finally(() => setIsLoadingHistory(false));
	}, [currentView, issuerResult?._id]);

	// Build options for the Issue form + drawer from holdings + optimistic + direct onchain creates
	const stockClassOptions = useMemo(() => {
		const fromHoldings = manager.holdings?.stockClasses || [];
		return [...fromHoldings, ...manager.createdStockClasses, ...directStockClasses].filter(Boolean);
	}, [manager.holdings?.stockClasses, manager.createdStockClasses, directStockClasses]);

	const stakeholderOptions = useMemo(() => {
		const fromHoldings = (manager.holdings?.holdings || []).map((h: { stakeholder?: any }) => h.stakeholder).filter(Boolean);
		return [...fromHoldings, ...manager.createdStakeholders, ...directStakeholders].filter(Boolean);
	}, [manager.holdings?.holdings, manager.createdStakeholders, directStakeholders]);

	const handleStockClass = async (data: StockClassData) => {
		if (!capTableAddress || !directStockClass.isConnected) {
			setSuccessModal({
				title: "Wallet Required",
				message: "Please connect your wallet (as Admin) to create a stock class onchain.",
			});
			return;
		}

		try {
			// One id is used for both the onchain bytes16 and the offchain _id (UUID form). The poller's
			// updateStockClassById converts the event's bytes16 back to this same UUID for sync.
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
				title: "Stock Class Created Onchain",
				message: "Your wallet successfully submitted the transaction to the CapTable contract.",
			});

			setDirectStockClasses((prev) => [...prev, { _id: stockClassUuid, name: data.name, class_type: data.class_type }]);

			registerStockClassOnchain({ issuerId: issuerResult._id, data, id: stockClassUuid }).catch((err) =>
				console.warn("Failed to register stock class metadata:", err),
			);

			manager.refreshHoldings();
		} catch (err) {
			console.error("Direct stock class creation failed", err);
			setSuccessModal({
				title: "Transaction Failed",
				message: "Failed to create stock class onchain. Check the console for details.",
			});
		}
	};

	const handleStakeholder = async (data: StakeholderData) => {
		if (!capTableAddress || !directStakeholder.isConnected) {
			setSuccessModal({
				title: "Wallet Required",
				message: "Please connect your wallet (as Admin) to create a stakeholder onchain.",
			});
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
				title: "Stakeholder Created Onchain",
				message: "Your wallet successfully submitted the transaction.",
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
				message: "Failed to create stakeholder onchain.",
			});
		}
	};

	const handleIssuance = async (data: StockIssuanceData) => {
		if (!capTableAddress || !directIssuance.isConnected) {
			setSuccessModal({
				title: "Wallet Required",
				message: "Please connect your wallet (as Admin) to issue stock onchain.",
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
				title: "Stock Issued Onchain",
				message: "Your wallet successfully submitted the issuance transaction.",
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
				message: "Failed to issue stock onchain.",
			});
		}
	};

	const handleNavigate = (view: MintView) => {
		setCurrentView(view);
	};

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
					<TablePanel>
						<HoldingsTable
							holdingsData={manager.holdings}
							createdStockClasses={[...manager.createdStockClasses, ...directStockClasses]}
							createdStakeholders={[...manager.createdStakeholders, ...directStakeholders]}
							createdIssuances={[...manager.createdIssuances, ...directIssuances]}
							onRefresh={manager.refreshHoldings}
							isLoading={manager.isLoadingHoldings}
						/>
					</TablePanel>
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
					<TablePanel>
						<HoldingsTable
							holdingsData={manager.holdings}
							createdStockClasses={[...manager.createdStockClasses, ...directStockClasses]}
							createdStakeholders={[...manager.createdStakeholders, ...directStakeholders]}
							createdIssuances={[...manager.createdIssuances, ...directIssuances]}
							onRefresh={manager.refreshHoldings}
							isLoading={manager.isLoadingHoldings}
						/>
					</TablePanel>
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
									{historicalTransactions.map((tx: any, idx: number) => { // TODO: type HistoricalTransaction
										const t = tx.transaction || {};
										return (
											<tr key={idx}>
												<td>{tx.transactionType}</td>
												<td style={{ fontSize: "0.8rem" }}>
													{t.custom_id || t.security_id?.slice(0, 8) || "—"}
												</td>
												<td style={{ fontFamily: "monospace" }}>{t.quantity}</td>
												<td>
													{t.share_price?.amount
														? `${(parseInt(t.share_price.amount) / 10000).toFixed(2)} ${t.share_price.currency}`
														: "—"}
												</td>
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

					<HoldingsTable
						holdingsData={manager.holdings}
						createdIssuances={[...manager.createdIssuances, ...directIssuances]}
						onRefresh={manager.refreshHoldings}
					/>
				</TablePanel>
			);
		}

		// Default: Overview
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
					/>
				</Panel>

				<TablePanel>
					<HoldingsTable
						holdingsData={manager.holdings}
						createdStockClasses={[...manager.createdStockClasses, ...directStockClasses]}
						createdStakeholders={[...manager.createdStakeholders, ...directStakeholders]}
						createdIssuances={[...manager.createdIssuances, ...directIssuances]}
						onRefresh={manager.refreshHoldings}
						isLoading={manager.isLoadingHoldings}
					/>
				</TablePanel>
			</ActionTableLayout>
		);
	};

	return (
		<FullScreenStack>
			<IssuerHeader
				issuer={issuerResult}
				contractAddress={manager.contractAddress}
				onReset={onReset}
			/>

			{(manager.lastError || manager.holdingsError) && (
				<StatusBox $variant="error">
					{manager.lastError || manager.holdingsError}
				</StatusBox>
			)}

			{renderMainContent()}

			<MintNavDrawer
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				currentView={currentView}
				onNavigate={handleNavigate}
				stockClasses={[...manager.createdStockClasses, ...directStockClasses].map((sc) => ({
					_id: sc._id,
					name: sc.name,
				}))}
				stakeholders={[...manager.createdStakeholders, ...directStakeholders].map((sh) => ({
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
