import type { ReactNode } from "react";
import { Section, SectionActions, SectionHeader, Stack } from "../../layout";
import { Button, StatusMessage } from "../../elements";
import { H3, MutedText } from "../../typography";
import { DataTable, type Column } from "../../DataTable";
import { StakeholderForm } from "../forms/StakeholderForm";
import { copy, shortTx } from "../../../lib/copy";
import type { StakeholderData } from "../../../services/createStakeholder";
import { EXPLORER_TX, type ActivityEntry } from "../../../utils/activityLog";
import { formatRelationship, formatStakeholderType } from "../types";

interface ShareholdersViewProps {
	stakeholders: any[];
	activityLog: ActivityEntry[];
	isLoading: boolean;
	syncNote: string | null;
	adding: boolean;
	onAddingChange: (v: boolean) => void;
	onSubmit: (data: StakeholderData) => Promise<void>;
	toolbar: ReactNode;
}

interface ShareholderRow {
	key: string;
	name: string;
	type: string;
	relationship: string;
	tx: ReactNode;
}

/** Resolve explorer TX for a shareholder: Mongo tx_hash, else activity log by entity id. */
function txForStakeholder(sh: any, activityLog: ActivityEntry[]): string | undefined {
	if (typeof sh.tx_hash === "string" && sh.tx_hash.startsWith("0x")) return sh.tx_hash;
	const id = sh._id as string | undefined;
	if (!id) return undefined;
	const hit = activityLog.find(
		(e) =>
			e.kind === "stakeholder" &&
			e.txHash &&
			(e.id.includes(id) || e.details === (sh.name?.legal_name || "")),
	);
	return hit?.txHash;
}

function renderTx(tx: string | undefined): ReactNode {
	if (!tx) return "—";
	return (
		<a href={EXPLORER_TX(tx)} target="_blank" rel="noopener noreferrer" title={tx}>
			{shortTx(tx)}
		</a>
	);
}

const columns: Column<ShareholderRow>[] = [
	{ key: "name", header: "Name", width: "28%", render: (r) => r.name },
	{ key: "type", header: "Type", width: "16%", render: (r) => r.type },
	{ key: "relationship", header: "Relationship", width: "18%", render: (r) => r.relationship },
	{ key: "tx", header: "Transaction", width: "20%", render: (r) => r.tx },
];

export function ShareholdersView({
	stakeholders,
	activityLog,
	isLoading,
	syncNote,
	adding,
	onAddingChange,
	onSubmit,
	toolbar,
}: ShareholdersViewProps) {
	const rows: ShareholderRow[] = stakeholders.map((sh: any) => ({
		key: sh._id,
		name: sh.name?.legal_name || sh.name?.first_name || "—",
		type: formatStakeholderType(sh.stakeholder_type),
		relationship: formatRelationship(sh.current_relationship),
		tx: renderTx(txForStakeholder(sh, activityLog)),
	}));

	return (
		<Stack $gap="xl" data-testid="view-stakeholders">
			<Section>
				<SectionHeader>
					<div>
						<H3>{copy.shareholders.title}</H3>
						<MutedText style={{ marginTop: "0.35rem" }}>
							{stakeholders.length} shareholder{stakeholders.length === 1 ? "" : "s"}
						</MutedText>
					</div>
					<SectionActions>
						{!adding && (
							<Button
								onClick={() => onAddingChange(true)}
								$variant="primary"
								disabled={isLoading}
							>
								{copy.shareholders.add}
							</Button>
						)}
						{toolbar}
					</SectionActions>
				</SectionHeader>
				{syncNote && <StatusMessage $variant="pending">{syncNote}</StatusMessage>}
				{adding && (
					<Section style={{ marginBottom: "1rem" }}>
						<StakeholderForm
							compact
							onSubmit={async (data) => {
								await onSubmit(data);
								onAddingChange(false);
							}}
							onCancel={() => onAddingChange(false)}
							disabled={isLoading}
						/>
					</Section>
				)}
				<DataTable<ShareholderRow>
					aria-label={copy.shareholders.title}
					columns={columns}
					rows={rows}
					rowKey={(r) => r.key}
					isLoading={isLoading}
					emptyMessage={copy.shareholders.empty}
				/>
			</Section>
		</Stack>
	);
}
