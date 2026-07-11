import type { ReactNode } from "react";
import {
	DataBand,
	MutedText,
	PageLayout,
	SectionHeader,
	StatusBox,
	TableTitle,
} from "../../wrappers";
import { DataTable, type Column } from "../../DataTable";
import { copy, shortTx } from "../../../lib/copy";
import { EXPLORER_TX, type ActivityEntry } from "../../../utils/activityLog";

interface TransactionsViewProps {
	activityLog: ActivityEntry[];
	historicalTransactions: any[];
	isLoadingHistory: boolean;
	syncNote: string | null;
	toolbar: ReactNode;
}

interface TxRow {
	key: string;
	type: string;
	details: string;
	quantity: string;
	price: string;
	date: string;
	status: string;
	tx: ReactNode;
}

function renderTx(txHash: string | undefined): ReactNode {
	if (!txHash) return "—";
	return (
		<a
			href={EXPLORER_TX(txHash)}
			target="_blank"
			rel="noopener noreferrer"
			title={txHash}
		>
			{shortTx(txHash)}
		</a>
	);
}

const columns: Column<TxRow>[] = [
	{ key: "type", header: copy.transactions.columns.type, width: "16%", render: (r) => r.type },
	{ key: "details", header: copy.transactions.columns.details, width: "22%", render: (r) => r.details },
	{
		key: "quantity",
		header: copy.transactions.columns.shares,
		align: "right",
		width: "12%",
		render: (r) => r.quantity,
	},
	{
		key: "price",
		header: copy.transactions.columns.price,
		align: "right",
		width: "12%",
		render: (r) => r.price,
	},
	{ key: "date", header: copy.transactions.columns.date, width: "12%", render: (r) => r.date },
	{ key: "status", header: copy.transactions.columns.status, width: "10%", render: (r) => r.status },
	{ key: "tx", header: copy.transactions.columns.tx, width: "14%", render: (r) => r.tx },
];

export function TransactionsView({
	activityLog,
	historicalTransactions,
	isLoadingHistory,
	syncNote,
	toolbar,
}: TransactionsViewProps) {
	const localRows: TxRow[] = activityLog.map((e) => ({
		key: e.id,
		type: copy.txTypeLabel(e.kind) || copy.txTypeLabel(e.type) || e.type,
		details: e.details,
		quantity: e.quantity ?? "—",
		price: e.price ?? "—",
		date: e.date,
		status:
			e.status === "confirmed"
				? "Confirmed"
				: e.status === "reverted"
					? "Failed"
					: e.txHash
						? "Submitted"
						: "Pending",
		tx: renderTx(e.txHash),
	}));

	const seenTx = new Set(
		activityLog
			.map((e) => e.txHash?.toLowerCase())
			.filter(Boolean) as string[],
	);

	const historyRows: TxRow[] = [];
	for (let idx = 0; idx < historicalTransactions.length; idx++) {
		const tx: any = historicalTransactions[idx];
		const t = tx.transaction || tx || {};
		const priceAmount = t.share_price?.amount;
		const rawHash =
			tx.tx_hash || t.tx_hash || tx.transactionHash || t.transaction_hash || t.txHash;
		const txHash =
			typeof rawHash === "string" && rawHash.startsWith("0x") ? rawHash : undefined;
		if (txHash && seenTx.has(txHash.toLowerCase())) continue;
		const ocfId = t._id || tx.transaction || `hist-${idx}`;
		historyRows.push({
			key: `hist-${ocfId}`,
			type: copy.txTypeLabel(tx.transactionType || t.object_type),
			details: t.custom_id || t.security_id || "—",
			quantity:
				t.quantity != null && t.quantity !== ""
					? Number(t.quantity).toLocaleString()
					: "—",
			price:
				priceAmount != null && priceAmount !== ""
					? `${priceAmount} ${t.share_price?.currency || "USD"}`
					: "—",
			date: t.date || "—",
			status: "Confirmed",
			tx: renderTx(txHash),
		});
	}

	const rows = [...localRows, ...historyRows];

	return (
		<PageLayout data-testid="view-transactions">
			<DataBand>
				<SectionHeader>
					<div>
						<TableTitle>{copy.transactions.title}</TableTitle>
						<MutedText style={{ marginTop: "0.35rem" }}>
							{rows.length} record{rows.length === 1 ? "" : "s"}
						</MutedText>
					</div>
					{toolbar}
				</SectionHeader>
				{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
				<DataTable<TxRow>
					aria-label={copy.transactions.title}
					columns={columns}
					rows={rows}
					rowKey={(r) => r.key}
					isLoading={isLoadingHistory}
					emptyMessage={copy.transactions.empty}
				/>
			</DataBand>
		</PageLayout>
	);
}
