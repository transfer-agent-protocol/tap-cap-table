import { MutedText, SectionActions, SectionHeader, StyledTable, TableScroll, TableTitle } from "./wrappers";
import { InlineButton } from "./buttons";

interface HoldingsTableProps {
	holdingsData: any; // debug/hybrid data from /cap-table/holdings/stock + optimistic direct creations
	createdStockClasses?: any[];
	createdStakeholders?: any[];
	createdIssuances?: any[];
	onRefresh?: () => void;
	isLoading?: boolean;
}

function formatSharePrice(sharePrice: unknown, currency: string = "USD"): string {
	if (sharePrice == null) return "—";
	// Server (`/cap-table/holdings/stock`) returns sharePrice as a plain number
	// (`Number(quantityPrice / quantity) / decimalScaleValue`). Optimistic rows
	// constructed client-side use the OCF shape `{ amount, currency }`.
	if (typeof sharePrice === "number") {
		if (!Number.isFinite(sharePrice) || sharePrice === 0) return "—";
		return `${sharePrice.toFixed(2)} ${currency}`;
	}
	if (typeof sharePrice === "object") {
		const s = sharePrice as { amount?: string | number; currency?: string };
		if (s.amount == null || s.amount === "" || s.amount === "0") return "—";
		return `${s.amount} ${s.currency || currency}`;
	}
	return "—";
}

export function HoldingsTable({ holdingsData, createdStockClasses = [], createdStakeholders = [], createdIssuances = [], onRefresh, isLoading }: HoldingsTableProps) {
	const holdings = holdingsData?.holdings || [];

	// Drop optimistic issuances once a matching real row arrives from the server. We dedupe on
	// stakeholder_id + stock_class_id because that's the join key the poller uses to materialize
	// a holding row, and the optimistic item carries those ids from the issuance form.
	const holdingKeys = new Set<string>(
		holdings.map((h: any) => `${h.stakeholder?._id}|${h.stockClass?._id}`),
	);
	const pendingIssuances = createdIssuances.filter(
		(iss: any) => !holdingKeys.has(`${iss.stakeholder_id}|${iss.stock_class_id}`),
	);


	return (
		<div>
			<SectionHeader>
				<TableTitle>Cap Table Holdings (live from server + optimistic)</TableTitle>
				{onRefresh && (
					<SectionActions>
						<InlineButton onClick={onRefresh} disabled={isLoading}>
							{isLoading ? "Refreshing..." : "Refresh"}
						</InlineButton>
						<InlineButton
							onClick={onRefresh}
							disabled={isLoading}
							title="Force re-fetch from MongoDB (bypasses cache)"
						>
							Force DB Refresh
						</InlineButton>
					</SectionActions>
				)}
			</SectionHeader>

			<TableScroll>
			<StyledTable>
				<thead>
					<tr>
						<th>Stakeholder</th>
						<th>Stock Class</th>
						<th>Quantity</th>
						<th>Share Price</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{holdings.length === 0 && createdStockClasses.length === 0 && createdStakeholders.length === 0 ? (
						<tr>
							<td colSpan={5} style={{ textAlign: "center", opacity: 0.7, padding: "1.5rem", lineHeight: 1.5 }}>
								<strong>No holdings yet.</strong><br /><br />
								The table shows live onchain positions (via <code>getAveragePosition</code>) joined with the latest issuance records from Mongo.<br />
								Recent direct onchain work appears here via optimistic state immediately, and becomes permanent once the poller has synced the events + rich metadata exists for the joins.
							</td>
						</tr>
					) : null}

					{holdings.map((h: any, idx: number) => (
						<tr key={idx}>
							<td>{h.stakeholder?.name?.legal_name || h.stakeholder?._id || "—"}</td>
							<td>{h.stockClass?.name || h.stockClass?._id || "—"}</td>
							<td style={{ fontFamily: "monospace" }}>{h.quantity}</td>
							<td>{formatSharePrice(h.sharePrice)}</td>
							<td>Onchain</td>
						</tr>
					))}

					{/* Optimistic rows from direct onchain creations (user wallet signed) — only ones the poller hasn't materialized yet */}
					{pendingIssuances.map((iss, i) => (
						<tr key={`iss-${i}`} style={{ opacity: 0.75 }}>
							<td>{iss.stakeholder_id}</td>
							<td>{iss.stock_class_id}</td>
							<td style={{ fontFamily: "monospace" }}>{iss.quantity} (pending)</td>
							<td>{formatSharePrice(iss.share_price)}</td>
							<td>
								{iss.txHash ? (
									<a 
										href={`https://explorer.plume.org/tx/${iss.txHash}`} 
										target="_blank" 
										rel="noopener noreferrer"
										style={{ color: "#16a34a", textDecoration: "underline" }}
									>
										Onchain ✓
									</a>
								) : "Pending sync"}
							</td>
						</tr>
					))}

					{/* Direct optimistic stock classes / stakeholders (for visibility in main table) */}
					{createdStockClasses
						.filter((sc: any) => sc.txHash)
						.map((sc: any, i: number) => (
							<tr key={`sc-opt-${i}`} style={{ opacity: 0.75, background: "#f8fafc" }}>
								<td colSpan={2}>Stock Class: {sc.name}</td>
								<td>—</td>
								<td>—</td>
								<td>
									<a 
										href={`https://explorer.plume.org/tx/${sc.txHash}`} 
										target="_blank" 
										rel="noopener noreferrer"
										style={{ color: "#16a34a", textDecoration: "underline" }}
									>
										Onchain ✓
									</a>
								</td>
							</tr>
						))}

					{createdStakeholders
						.filter((sh: any) => sh.txHash)
						.map((sh: any, i: number) => (
							<tr key={`sh-opt-${i}`} style={{ opacity: 0.75, background: "#f8fafc" }}>
								<td>Stakeholder: {(sh.name?.legal_name || sh.name) || sh._id}</td>
								<td>—</td>
								<td>—</td>
								<td>—</td>
								<td>
									<a 
										href={`https://explorer.plume.org/tx/${sh.txHash}`} 
										target="_blank" 
										rel="noopener noreferrer"
										style={{ color: "#16a34a", textDecoration: "underline" }}
									>
										Onchain ✓
									</a>
								</td>
							</tr>
						))}
				</tbody>
			</StyledTable>
			</TableScroll>

			<MutedText>
				Holdings come from <code>/cap-table/holdings/stock</code> (latest Mongo issuances + live
				onchain <code>getAveragePosition</code> — only positive quantities are shown), merged with
				optimistic direct creations from this session. Recent onchain activity may take a moment
				to fully surface after the poller and metadata registration.
			</MutedText>
		</div>
	);
}
