import { useMemo, useState } from "react";
import styled from "styled-components";
import { Button } from "../../elements";
import { DataTable, type Column } from "../../DataTable";
import { SectionActions, SectionHeader } from "../../layout";
import { H3 } from "../../typography";
import { TextInput } from "../../forms";
import { copy } from "../../../lib/copy";
import { holdingStatusForIssuance } from "../../../utils/holdingStatus";

const PAGE_SIZE = 25;

const Controls = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing.sm};
	width: 100%;
`;

const SearchInput = styled(TextInput)`
	max-width: 16rem;
	height: 2.25rem;
	font-size: ${({ theme }) => theme.fontSizes.small};
`;

const ModeToggle = styled.div`
	display: inline-flex;
	flex-flow: row nowrap;
	border: 1px solid ${({ theme }) => theme.colors.border};

	button {
		border: none;
	}
`;

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
		confirmed?: boolean;
	}>;
	onRefresh?: () => void;
	isLoading?: boolean;
	error?: string | null;
	compact?: boolean;
	/** Extra empty-state guidance (e.g. class not onchain yet) */
	emptyHint?: string;
}

/** One position: holder × class. Raw values kept for sort/filter. */
interface HoldingRow {
	key: string;
	holderId: string;
	holderName: string;
	className: string;
	quantity: number;
	priceText: string;
	statusText: string;
}

interface GroupedRow {
	key: string;
	holderName: string;
	breakdown: string;
	classCount: number;
	quantity: number;
	statusText: string;
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

const fmtQty = (q: number) => (Number.isFinite(q) ? q.toLocaleString() : "—");

const flatColumns: Column<HoldingRow>[] = [
	{
		key: "stakeholder",
		header: copy.holdings.columns.stakeholder,
		width: "26%",
		render: (r) => r.holderName,
		sortValue: (r) => r.holderName,
	},
	{
		key: "stockClass",
		header: copy.holdings.columns.stockClass,
		width: "22%",
		render: (r) => r.className,
		sortValue: (r) => r.className,
	},
	{
		key: "quantity",
		header: copy.holdings.columns.quantity,
		align: "right",
		width: "16%",
		render: (r) => fmtQty(r.quantity),
		sortValue: (r) => r.quantity,
	},
	{
		key: "sharePrice",
		header: copy.holdings.columns.sharePrice,
		align: "right",
		width: "16%",
		render: (r) => r.priceText,
	},
	{ key: "status", header: copy.holdings.columns.status, width: "14%", render: (r) => r.statusText },
];

const groupedColumns: Column<GroupedRow>[] = [
	{
		key: "stakeholder",
		header: copy.holdings.columns.stakeholder,
		width: "26%",
		render: (r) => r.holderName,
		sortValue: (r) => r.holderName,
	},
	{
		key: "breakdown",
		header: "Stock classes",
		width: "38%",
		render: (r) => r.breakdown,
	},
	{
		key: "quantity",
		header: "Total shares",
		align: "right",
		width: "18%",
		render: (r) => fmtQty(r.quantity),
		sortValue: (r) => r.quantity,
	},
	{ key: "status", header: copy.holdings.columns.status, width: "14%", render: (r) => r.statusText },
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
	emptyHint,
}: HoldingsTableProps) {
	const [query, setQuery] = useState("");
	const [mode, setMode] = useState<"holding" | "shareholder">("holding");

	const holdings: any[] = holdingsData?.holdings || [];
	const allStakeholders = [...(holdingsData?.stakeholders || []), ...createdStakeholders];
	const allClasses = [...(holdingsData?.stockClasses || []), ...createdStockClasses];

	const holdingKeys = new Set<string>(
		holdings.map((h) => `${h.stakeholder?._id}|${h.stockClass?._id}`),
	);

	// Drop session rows once chain holdings API has the same holder+class pair
	const sessionIssuances = createdIssuances.filter(
		(iss) => !holdingKeys.has(`${iss.stakeholder_id}|${iss.stock_class_id}`),
	);

	const waitingOnReceipt = sessionIssuances.some(
		(iss) => holdingStatusForIssuance(iss) === "Pending",
	);

	const rows: HoldingRow[] = useMemo(
		() => [
			...holdings.map((h, i) => ({
				key: `h-${i}`,
				holderId: h.stakeholder?._id || `h-${i}`,
				holderName: h.stakeholder?.name?.legal_name || h.stakeholder?._id || "—",
				className: h.stockClass?.name || h.stockClass?._id || "—",
				quantity: Number(h.quantity) || 0,
				priceText: formatSharePrice(h.sharePrice),
				statusText: copy.status.onchain,
			})),
			...sessionIssuances.map((iss, i) => {
				const status = holdingStatusForIssuance(iss);
				return {
					key: `iss-${i}`,
					holderId: iss.stakeholder_id,
					holderName: resolveName(
						iss.stakeholder_id,
						iss.stakeholder_name,
						allStakeholders,
						"stakeholder",
					),
					className: resolveName(
						iss.stock_class_id,
						iss.stock_class_name,
						allClasses,
						"stockClass",
					),
					quantity: Number(iss.quantity) || 0,
					priceText: formatSharePrice(iss.share_price),
					statusText: status === "Confirmed" ? copy.status.onchain : copy.status.pending,
				};
			}),
		],
		[holdings, sessionIssuances, allStakeholders, allClasses],
	);

	// Search narrows by shareholder or class name
	const q = query.trim().toLowerCase();
	const filtered = q
		? rows.filter(
				(r) =>
					r.holderName.toLowerCase().includes(q) || r.className.toLowerCase().includes(q),
			)
		: rows;

	// Grouped: one row per shareholder, positions aggregated across classes
	const grouped: GroupedRow[] = useMemo(() => {
		const byHolder = new Map<string, GroupedRow & { pending: boolean }>();
		for (const r of filtered) {
			const prev = byHolder.get(r.holderId);
			const piece = `${r.className} ${fmtQty(r.quantity)}`;
			if (prev) {
				prev.quantity += r.quantity;
				prev.classCount += 1;
				prev.breakdown = `${prev.breakdown} · ${piece}`;
				prev.pending = prev.pending || r.statusText !== copy.status.onchain;
			} else {
				byHolder.set(r.holderId, {
					key: r.holderId,
					holderName: r.holderName,
					breakdown: piece,
					classCount: 1,
					quantity: r.quantity,
					statusText: r.statusText,
					pending: r.statusText !== copy.status.onchain,
				});
			}
		}
		return Array.from(byHolder.values()).map((g) => ({
			...g,
			statusText: g.pending ? copy.status.pending : copy.status.onchain,
		}));
	}, [filtered]);

	const showControls = rows.length > 0 || q.length > 0;

	return (
		<div>
			{!compact && (
				<SectionHeader>
					<H3>{copy.holdings.title}</H3>
					{onRefresh && (
						<SectionActions>
							<Button onClick={onRefresh} disabled={isLoading}>
								{isLoading ? "Refreshing…" : "Refresh"}
							</Button>
						</SectionActions>
					)}
				</SectionHeader>
			)}

			{showControls && (
				<Controls style={{ marginBottom: "0.75rem" }}>
					<SearchInput
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search shareholder or class…"
						aria-label="Search holdings"
						data-testid="holdings-search"
					/>
					<ModeToggle role="group" aria-label="Group holdings">
						<Button
							$variant={mode === "holding" ? "secondary" : "ghost"}
							type="button"
							aria-pressed={mode === "holding"}
							onClick={() => setMode("holding")}
							data-testid="holdings-mode-flat"
						>
							By holding
						</Button>
						<Button
							$variant={mode === "shareholder" ? "secondary" : "ghost"}
							type="button"
							aria-pressed={mode === "shareholder"}
							onClick={() => setMode("shareholder")}
							data-testid="holdings-mode-grouped"
						>
							By shareholder
						</Button>
					</ModeToggle>
				</Controls>
			)}

			{mode === "holding" ? (
				<DataTable<HoldingRow>
					columns={flatColumns}
					rows={filtered}
					rowKey={(r) => r.key}
					isLoading={isLoading}
					error={error}
					pageSize={PAGE_SIZE}
					initialSort={{ key: "quantity", dir: "desc" }}
					emptyMessage={q ? `No holdings match “${query}”.` : emptyHint || copy.holdings.empty}
					caption={
						waitingOnReceipt
							? "Pending = waiting for the wallet transaction to confirm."
							: undefined
					}
				/>
			) : (
				<DataTable<GroupedRow>
					columns={groupedColumns}
					rows={grouped}
					rowKey={(r) => r.key}
					isLoading={isLoading}
					error={error}
					pageSize={PAGE_SIZE}
					initialSort={{ key: "quantity", dir: "desc" }}
					emptyMessage={q ? `No holdings match “${query}”.` : emptyHint || copy.holdings.empty}
					caption={
						waitingOnReceipt
							? "Pending = waiting for the wallet transaction to confirm."
							: undefined
					}
				/>
			)}
		</div>
	);
}
