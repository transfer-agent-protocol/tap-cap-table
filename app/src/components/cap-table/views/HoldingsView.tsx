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
	onNavigate,
}: HoldingsViewProps) {
	const showSetup = !isLoading && positionCount === 0;

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
				{holdingsTable}
			</DataBand>
		</PageLayout>
	);
}
