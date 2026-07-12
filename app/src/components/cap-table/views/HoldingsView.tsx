import type { ReactNode } from "react";
import { Section, SectionHeader, Stack } from "../../layout";
import { StatCard, StatGrid, StatLabel, StatValue, StatusMessage } from "../../elements";
import { H3, MutedText } from "../../typography";
import { copy } from "../../../lib/copy";
import { SetupChecklist } from "../SetupChecklist";
import { OwnershipBar } from "../OwnershipBar";
import { buildOwnershipChart, formatPct, formatShares } from "../ownershipModel";
import type { CapTableView } from "../../shell/navConfig";

interface HoldingsViewProps {
	positionCount: number;
	peopleCount: number;
	onchainClassCount: number;
	ghostClassCount: number;
	hasPendingSync: boolean;
	isLoading: boolean;
	syncNote: string | null;
	toolbar: ReactNode;
	holdingsTable: ReactNode;
	holdingsData: any;
	createdIssuances?: Array<{
		stakeholder_id: string;
		stock_class_id: string;
		quantity: string;
		stakeholder_name?: string;
		stock_class_name?: string;
		confirmed?: boolean;
		txHash?: string;
	}>;
	onNavigate: (view: CapTableView) => void;
}

export function HoldingsView({
	positionCount,
	peopleCount,
	onchainClassCount,
	ghostClassCount,
	hasPendingSync,
	isLoading,
	syncNote,
	toolbar,
	holdingsTable,
	holdingsData,
	createdIssuances = [],
	onNavigate,
}: HoldingsViewProps) {
	const showSetup = !isLoading && positionCount === 0;
	const showBar = !isLoading && positionCount > 0;

	// Authorized vs issued — don't let a 10B-share authorization hide behind a
	// 1M-share issuance. Issued reuses the ownership chart total (chain holdings
	// + optimistic session rows, deduped).
	const authorized = Number(holdingsData?.issuer?.initial_shares_authorized);
	const issued = buildOwnershipChart(holdingsData, createdIssuances)?.total ?? 0;
	const hasAuthorized = Number.isFinite(authorized) && authorized > 0;
	const remaining = hasAuthorized ? Math.max(authorized - issued, 0) : 0;
	const issuedPct = hasAuthorized ? (issued / authorized) * 100 : 0;
	const showStats = !isLoading && hasAuthorized;

	return (
		<Stack $gap="xl" data-testid="view-overview">
			<Section>
				<SectionHeader>
					<div>
						<H3>{copy.holdings.title}</H3>
						<MutedText style={{ marginTop: "0.35rem" }}>
							{positionCount} holding{positionCount === 1 ? "" : "s"}
							{" · "}
							{peopleCount} shareholder{peopleCount === 1 ? "" : "s"}
							{" · "}
							{onchainClassCount} stock class{onchainClassCount === 1 ? "" : "es"}
							{hasPendingSync ? " · waiting on wallet…" : ""}
						</MutedText>
					</div>
					{toolbar}
				</SectionHeader>
				{showSetup && (
					<SetupChecklist
						peopleCount={peopleCount}
						onchainClassCount={onchainClassCount}
						onNavigate={onNavigate}
					/>
				)}
				{ghostClassCount > 0 && positionCount === 0 && !showSetup && (
					<StatusMessage $variant="pending">{copy.sync.ghostClasses}</StatusMessage>
				)}
				{syncNote && <StatusMessage $variant="pending">{syncNote}</StatusMessage>}
				{showStats && (
					<StatGrid data-testid="share-stats">
						<StatCard>
							<StatLabel>Authorized</StatLabel>
							<StatValue>{formatShares(authorized)}</StatValue>
						</StatCard>
						<StatCard>
							<StatLabel>Issued</StatLabel>
							<StatValue>{formatShares(issued)}</StatValue>
						</StatCard>
						<StatCard>
							<StatLabel>Remaining</StatLabel>
							<StatValue>{formatShares(remaining)}</StatValue>
						</StatCard>
						<StatCard>
							<StatLabel>% issued</StatLabel>
							<StatValue>{formatPct(issuedPct)}</StatValue>
						</StatCard>
					</StatGrid>
				)}
				{showBar && (
					<OwnershipBar
						holdingsData={holdingsData}
						createdIssuances={createdIssuances}
					/>
				)}
				{holdingsTable}
			</Section>
		</Stack>
	);
}
