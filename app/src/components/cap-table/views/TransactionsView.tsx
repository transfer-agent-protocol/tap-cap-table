import type { ReactNode } from "react";
import {
	DataBand,
	MutedText,
	PageLayout,
	SectionHeader,
	StatusBox,
	StyledTable,
	TableScroll,
	TableTitle,
} from "../../wrappers";
import { copy, shortTx } from "../../../lib/copy";
import { EXPLORER_TX, type ActivityEntry } from "../../../utils/activityLog";

interface TransactionsViewProps {
	activityLog: ActivityEntry[];
	historicalTransactions: any[];
	isLoadingHistory: boolean;
	syncNote: string | null;
	toolbar: ReactNode;
}

export function TransactionsView({
	activityLog,
	historicalTransactions,
	isLoadingHistory,
	syncNote,
	toolbar,
}: TransactionsViewProps) {
	const localRows = activityLog.map((e) => ({
		key: e.id,
		// Prefer kind map; also normalize legacy labels already stored in localStorage
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
		txHash: e.txHash,
	}));

	const seenTx = new Set(
		localRows.map((r) => r.txHash?.toLowerCase()).filter(Boolean) as string[],
	);

	const historyRows = historicalTransactions
		.map((tx: any, idx: number) => {
			const t = tx.transaction || tx || {};
			const priceAmount = t.share_price?.amount;
			const rawHash =
				tx.tx_hash || t.tx_hash || tx.transactionHash || t.transaction_hash || t.txHash;
			const txHash =
				typeof rawHash === "string" && rawHash.startsWith("0x") ? rawHash : undefined;
			const ocfId = t._id || tx.transaction || `hist-${idx}`;
			return {
				key: `hist-${ocfId}`,
				type: copy.txTypeLabel(tx.transactionType || t.object_type),
				details: t.custom_id || t.security_id || "—",
				quantity: t.quantity ?? "—",
				price:
					priceAmount != null && priceAmount !== ""
						? `${priceAmount} ${t.share_price?.currency || "USD"}`
						: "—",
				date: t.date || "—",
				status: "Confirmed",
				txHash,
			};
		})
		.filter((r) => !r.txHash || !seenTx.has(r.txHash.toLowerCase()));

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
				<TableScroll>
					<StyledTable>
						<thead>
							<tr>
								<th>{copy.transactions.columns.type}</th>
								<th>{copy.transactions.columns.details}</th>
								<th>{copy.transactions.columns.shares}</th>
								<th>{copy.transactions.columns.price}</th>
								<th>{copy.transactions.columns.date}</th>
								<th>{copy.transactions.columns.status}</th>
								<th>{copy.transactions.columns.tx}</th>
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 ? (
								<tr>
									<td colSpan={7}>
										<MutedText>
											{isLoadingHistory ? "Loading…" : copy.transactions.empty}
										</MutedText>
									</td>
								</tr>
							) : (
								rows.map((r) => (
									<tr key={r.key}>
										<td>{r.type}</td>
										<td>{r.details}</td>
										<td>{r.quantity}</td>
										<td>{r.price}</td>
										<td>{r.date}</td>
										<td>{r.status}</td>
										<td>
											{r.txHash ? (
												<a
													href={EXPLORER_TX(r.txHash)}
													target="_blank"
													rel="noopener noreferrer"
													title={r.txHash}
												>
													{shortTx(r.txHash)}
												</a>
											) : (
												"—"
											)}
										</td>
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
