import type { ReactNode } from "react";
import { InlineButton } from "./buttons";
import { DataTable, type Column } from "./DataTable";
import { SectionActions, SectionHeader, TableTitle } from "./wrappers";
import { copy } from "../lib/copy";

interface HoldingsTableProps {
	holdingsData: any;
	createdStockClasses?: any[];
	createdStakeholders?: any[];
	createdIssuances?: Array<{
		_id: string;
		security_id?: string;
		quantity: string;
		stakeholder_id: string;
		stock_class_id: string;
		share_price?: { amount?: string; currency?: string };
		stakeholder_name?: string;
		stock_class_name?: string;
		custom_id?: string;
		txHash?: string;
	}>;
	onRefresh?: () => void;
	isLoading?: boolean;
	error?: string | null;
	/** Hide the title band when the parent page already labels the section */
	compact?: boolean;
}

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

function resolveName(
	id: string,
	nameHint: string | undefined,
	list: any[] | undefined,
	kind: "stakeholder" | "stockClass",
): string {
	if (nameHint) return nameHint;
	const hit = (list || []).find((x: any) => x._id === id);
	if (!hit) return id;
	if (kind === "stakeholder") return hit.name?.legal_name || hit.name?.first_name || id;
	return hit.name || id;
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
	compact = false,
}: HoldingsTableProps) {
	const holdings: any[] = holdingsData?.holdings || [];
	const allStakeholders = [...(holdingsData?.stakeholders || []), ...createdStakeholders];
	const allClasses = [...(holdingsData?.stockClasses || []), ...createdStockClasses];

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
			stakeholder: resolveName(iss.stakeholder_id, iss.stakeholder_name, allStakeholders, "stakeholder"),
			stockClass: resolveName(iss.stock_class_id, iss.stock_class_name, allClasses, "stockClass"),
			quantity: iss.quantity,
			sharePrice: formatSharePrice(iss.share_price),
			status: copy.status.pending,
		})),
	];

	return (
		<div>
			{!compact && (
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
			)}

			{/* Always a real table (headers + body) — empty state is a table row */}
			<DataTable<HoldingRow>
				columns={columns}
				rows={rows}
				rowKey={(r) => r.key}
				isLoading={isLoading}
				error={error}
				emptyMessage={copy.holdings.empty}
				caption={
					pendingIssuances.length > 0
						? "Pending rows are from this session. Use Sync ledger if they stay pending."
						: undefined
				}
			/>
		</div>
	);
}
