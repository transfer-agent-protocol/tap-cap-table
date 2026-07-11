import type { ReactNode } from "react";
import { InlineButton } from "./buttons";
import { DataTable, type Column } from "./DataTable";
import { SectionActions, SectionHeader, TableTitle } from "./wrappers";
import { copy } from "../lib/copy";

interface HoldingsTableProps {
	holdingsData: any; // response from /cap-table/holdings/stock
	createdStockClasses?: any[];
	createdStakeholders?: any[];
	createdIssuances?: any[];
	onRefresh?: () => void;
	isLoading?: boolean;
	error?: string | null;
}

// One flat row shape for every kind of entry (server holding, pending issuance, optimistic
// class/stakeholder) so the generic DataTable can render them uniformly.
interface HoldingRow {
	key: string;
	stakeholder: ReactNode;
	stockClass: ReactNode;
	quantity: ReactNode;
	sharePrice: ReactNode;
	status: ReactNode;
}

function formatSharePrice(sharePrice: unknown, currency = "USD"): string {
	if (sharePrice == null) return "—";
	// Server returns a plain number; optimistic rows use the OCF `{ amount, currency }` shape.
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

function ExplorerLink({ txHash, label }: { txHash: string; label: string }) {
	return (
		<a href={`https://explorer.plume.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
			{label}
		</a>
	);
}

const columns: Column<HoldingRow>[] = [
	{ key: "stakeholder", header: copy.holdings.columns.stakeholder, render: (r) => r.stakeholder },
	{ key: "stockClass", header: copy.holdings.columns.stockClass, render: (r) => r.stockClass },
	{ key: "quantity", header: copy.holdings.columns.quantity, align: "right", render: (r) => r.quantity },
	{ key: "sharePrice", header: copy.holdings.columns.sharePrice, align: "right", render: (r) => r.sharePrice },
	{ key: "status", header: copy.holdings.columns.status, render: (r) => r.status },
];

export function HoldingsTable({
	holdingsData,
	createdStockClasses = [],
	createdStakeholders = [],
	createdIssuances = [],
	onRefresh,
	isLoading,
	error = null,
}: HoldingsTableProps) {
	const holdings: any[] = holdingsData?.holdings || [];

	// Drop optimistic issuances once a matching server row exists (join key: stakeholder + class).
	const holdingKeys = new Set<string>(holdings.map((h) => `${h.stakeholder?._id}|${h.stockClass?._id}`));
	const pendingIssuances = createdIssuances.filter(
		(iss) => !holdingKeys.has(`${iss.stakeholder_id}|${iss.stock_class_id}`),
	);

	const rows: HoldingRow[] = [
		...holdings.map((h, i) => ({
			key: `h-${i}`,
			stakeholder: h.stakeholder?.name?.legal_name || h.stakeholder?._id || "—",
			stockClass: h.stockClass?.name || h.stockClass?._id || "—",
			quantity: h.quantity,
			sharePrice: formatSharePrice(h.sharePrice),
			status: copy.status.onchain,
		})),
		...pendingIssuances.map((iss, i) => ({
			key: `iss-${i}`,
			stakeholder: iss.stakeholder_id,
			stockClass: iss.stock_class_id,
			quantity: `${iss.quantity} (pending)`,
			sharePrice: formatSharePrice(iss.share_price),
			status: iss.txHash ? <ExplorerLink txHash={iss.txHash} label="Onchain ✓" /> : copy.status.pending,
		})),
		...createdStockClasses
			.filter((sc) => sc.txHash)
			.map((sc, i) => ({
				key: `sc-${i}`,
				stakeholder: "—",
				stockClass: `Stock Class: ${sc.name}`,
				quantity: "—",
				sharePrice: "—",
				status: <ExplorerLink txHash={sc.txHash} label="Onchain ✓" />,
			})),
		...createdStakeholders
			.filter((sh) => sh.txHash)
			.map((sh, i) => ({
				key: `sh-${i}`,
				stakeholder: `Stakeholder: ${sh.name?.legal_name || sh.name || sh._id}`,
				stockClass: "—",
				quantity: "—",
				sharePrice: "—",
				status: <ExplorerLink txHash={sh.txHash} label="Onchain ✓" />,
			})),
	];

	return (
		<div>
			<SectionHeader>
				<TableTitle>{copy.holdings.title}</TableTitle>
				{onRefresh && (
					<SectionActions>
						<InlineButton onClick={onRefresh} disabled={isLoading}>
							{isLoading ? "Refreshing…" : "Refresh"}
						</InlineButton>
					</SectionActions>
				)}
			</SectionHeader>

			<DataTable<HoldingRow>
				columns={columns}
				rows={rows}
				rowKey={(r) => r.key}
				isLoading={isLoading}
				error={error}
				emptyMessage={copy.holdings.empty}
				caption={copy.holdings.caption}
			/>
		</div>
	);
}
