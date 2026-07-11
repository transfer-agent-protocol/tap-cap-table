import type { ReactNode } from "react";
import {
	DataBand,
	MutedText,
	PageLayout,
	SectionHeader,
	StatusBox,
	TableTitle,
} from "../../wrappers";
import { copy } from "../../../lib/copy";
import { SetupChecklist } from "../SetupChecklist";
import { OwnershipBar } from "../OwnershipBar";
import type { CapTableView } from "../../navConfig";

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

	return (
		<PageLayout data-testid="view-overview">
			<DataBand>
				<SectionHeader>
					<div>
						<TableTitle>{copy.holdings.title}</TableTitle>
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
					<StatusBox $variant="pending">{copy.sync.ghostClasses}</StatusBox>
				)}
				{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
				{showBar && (
					<OwnershipBar
						holdingsData={holdingsData}
						createdIssuances={createdIssuances}
					/>
				)}
				{holdingsTable}
			</DataBand>
		</PageLayout>
	);
}
