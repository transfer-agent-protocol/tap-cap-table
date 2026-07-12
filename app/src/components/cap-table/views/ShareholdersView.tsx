import { useState, type ReactNode } from "react";
import styled from "styled-components";
import { Section, SectionActions, SectionHeader, Stack } from "../../layout";
import { Button, StatusMessage } from "../../elements";
import { H3, MutedText } from "../../typography";
import { TextInput } from "../../forms";
import { DataTable, type Column } from "../../DataTable";
import { StakeholderForm } from "../forms/StakeholderForm";
import { copy, shortTx } from "../../../lib/copy";
import type { StakeholderData } from "../../../services/createStakeholder";
import { EXPLORER_TX, type ActivityEntry } from "../../../utils/activityLog";
import { formatRelationship, formatStakeholderType } from "../types";

const SearchInput = styled(TextInput)`
	max-width: 16rem;
	height: 2.25rem;
	font-size: ${({ theme }) => theme.fontSizes.small};
`;

interface ShareholdersViewProps {
	stakeholders: any[];
	activityLog: ActivityEntry[];
	isLoading: boolean;
	syncNote: string | null;
	adding: boolean;
	onAddingChange: (v: boolean) => void;
	onSubmit: (data: StakeholderData) => Promise<void>;
	toolbar: ReactNode;
	/** Current positions — drives Total shares / Holdings columns */
	holdings?: Array<{ stakeholder?: { _id?: string }; quantity?: number | string }>;
}

interface ShareholderRow {
	key: string;
	name: string;
	type: string;
	relationship: string;
	totalShares: number;
	holdingsCount: number;
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
	{ key: "name", header: "Name", width: "24%", render: (r) => r.name, sortValue: (r) => r.name },
	{ key: "type", header: "Type", width: "12%", render: (r) => r.type },
	{ key: "relationship", header: "Relationship", width: "16%", render: (r) => r.relationship },
	{
		key: "totalShares",
		header: "Total shares",
		align: "right",
		width: "14%",
		render: (r) => (r.totalShares > 0 ? r.totalShares.toLocaleString() : "—"),
		sortValue: (r) => r.totalShares,
	},
	{
		key: "holdingsCount",
		header: "Holdings",
		align: "right",
		width: "10%",
		render: (r) => (r.holdingsCount > 0 ? String(r.holdingsCount) : "—"),
		sortValue: (r) => r.holdingsCount,
	},
	{ key: "tx", header: "Transaction", width: "16%", render: (r) => r.tx },
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
	holdings = [],
}: ShareholdersViewProps) {
	const [query, setQuery] = useState("");

	// Aggregate positions per shareholder for the Total shares / Holdings columns
	const sharesByHolder = new Map<string, { total: number; count: number }>();
	for (const h of holdings) {
		const id = h.stakeholder?._id;
		const qty = Number(h.quantity);
		if (!id || !Number.isFinite(qty) || qty <= 0) continue;
		const prev = sharesByHolder.get(id) || { total: 0, count: 0 };
		sharesByHolder.set(id, { total: prev.total + qty, count: prev.count + 1 });
	}

	const allRows: ShareholderRow[] = stakeholders.map((sh: any) => ({
		key: sh._id,
		name: sh.name?.legal_name || sh.name?.first_name || "—",
		type: formatStakeholderType(sh.stakeholder_type),
		relationship: formatRelationship(sh.current_relationship),
		totalShares: sharesByHolder.get(sh._id)?.total ?? 0,
		holdingsCount: sharesByHolder.get(sh._id)?.count ?? 0,
		tx: renderTx(txForStakeholder(sh, activityLog)),
	}));

	const q = query.trim().toLowerCase();
	const rows = q ? allRows.filter((r) => r.name.toLowerCase().includes(q)) : allRows;

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
				{(allRows.length > 0 || q.length > 0) && (
					<SearchInput
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search shareholders…"
						aria-label="Search shareholders"
						data-testid="shareholders-search"
					/>
				)}
				<DataTable<ShareholderRow>
					aria-label={copy.shareholders.title}
					columns={columns}
					rows={rows}
					rowKey={(r) => r.key}
					isLoading={isLoading}
					pageSize={25}
					initialSort={{ key: "totalShares", dir: "desc" }}
					emptyMessage={q ? `No shareholders match “${query}”.` : copy.shareholders.empty}
				/>
			</Section>
		</Stack>
	);
}
