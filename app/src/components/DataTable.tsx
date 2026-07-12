import { useEffect, useMemo, useState, type ReactNode } from "react";
import styled from "styled-components";
import { Button, StatusMessage, Table, TableFrame } from "./elements";
import { MutedText } from "./typography";

export interface Column<T> {
	key: string;
	header: ReactNode;
	align?: "left" | "right" | "center";
	/** Optional fixed/min width e.g. "8rem" or "12%" */
	width?: string;
	render: (row: T) => ReactNode;
	/**
	 * Presence makes the column sortable. Return a number for numeric
	 * columns (shares, prices) or a string for text.
	 */
	sortValue?: (row: T) => number | string;
}

export interface DataTableProps<T> {
	columns: Column<T>[];
	rows: T[];
	rowKey: (row: T, index: number) => string;
	/** Drives the loading / error states; omit for a plain data/empty table. */
	isLoading?: boolean;
	error?: string | null;
	emptyMessage?: ReactNode;
	/** Optional muted footnote under the table. */
	caption?: ReactNode;
	/** Accessible label for the table */
	"aria-label"?: string;
	/** Render at most this many rows, with a "Show N more" control. */
	pageSize?: number;
	/** Initial sort; users can override by clicking sortable headers. */
	initialSort?: { key: string; dir: "asc" | "desc" };
}

const SortHeader = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0;
	border: none;
	background: transparent;
	font: inherit;
	color: inherit;
	letter-spacing: inherit;
	text-transform: inherit;
	cursor: pointer;

	&:hover {
		color: ${({ theme }) => theme.colors.text};
	}
`;

const TableFooter = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-top: ${({ theme }) => theme.spacing.sm};
`;

function compare(a: number | string, b: number | string): number {
	if (typeof a === "number" && typeof b === "number") {
		return a - b;
	}
	return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

/**
 * Shared data table for the manage workspace.
 * Always renders one explicit state: error, first-load, empty, or rows.
 * Opt-in per-column sorting (`sortValue`) and incremental pagination
 * (`pageSize`) keep large cap tables scannable without virtualization.
 */
export function DataTable<T>({
	columns,
	rows,
	rowKey,
	isLoading = false,
	error = null,
	emptyMessage = "Nothing here yet.",
	caption,
	"aria-label": ariaLabel,
	pageSize,
	initialSort,
}: DataTableProps<T>) {
	const span = columns.length;
	const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
		initialSort ?? null,
	);
	const [visible, setVisible] = useState(pageSize ?? Infinity);

	// New data (search, refresh) resets pagination so results aren't hidden.
	useEffect(() => {
		setVisible(pageSize ?? Infinity);
	}, [rows.length, pageSize]);

	const sorted = useMemo(() => {
		if (!sort) return rows;
		const col = columns.find((c) => c.key === sort.key);
		if (!col?.sortValue) return rows;
		const dir = sort.dir === "asc" ? 1 : -1;
		return [...rows].sort((a, b) => dir * compare(col.sortValue!(a), col.sortValue!(b)));
	}, [rows, columns, sort]);

	const shown = Number.isFinite(visible) ? sorted.slice(0, visible) : sorted;
	const hiddenCount = sorted.length - shown.length;

	const toggleSort = (key: string) => {
		setSort((prev) =>
			prev?.key === key
				? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
				: { key, dir: "desc" },
		);
	};

	return (
		<div style={{ width: "100%" }}>
			<TableFrame>
				<Table aria-label={ariaLabel}>
					<thead>
						<tr>
							{columns.map((c) => (
								<th
									key={c.key}
									style={{
										textAlign: c.align ?? "left",
										width: c.width,
									}}
									aria-sort={
										sort?.key === c.key
											? sort.dir === "asc"
												? "ascending"
												: "descending"
											: undefined
									}
								>
									{c.sortValue ? (
										<SortHeader
											type="button"
											onClick={() => toggleSort(c.key)}
											title="Sort"
										>
											{c.header}
											{sort?.key === c.key ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
										</SortHeader>
									) : (
										c.header
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{error ? (
							<tr>
								<td colSpan={span} style={{ padding: "1rem" }}>
									<StatusMessage $variant="error">{error}</StatusMessage>
								</td>
							</tr>
						) : isLoading && rows.length === 0 ? (
							<tr>
								<td
									colSpan={span}
									style={{ textAlign: "center", padding: "1.5rem", opacity: 0.7 }}
								>
									Loading…
								</td>
							</tr>
						) : rows.length === 0 ? (
							<tr>
								<td colSpan={span} style={{ padding: "1.5rem" }}>
									<MutedText>{emptyMessage}</MutedText>
								</td>
							</tr>
						) : (
							shown.map((row, i) => (
								<tr key={rowKey(row, i)}>
									{columns.map((c) => (
										<td key={c.key} style={{ textAlign: c.align ?? "left" }}>
											{c.render(row)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</Table>
			</TableFrame>
			{(hiddenCount > 0 || caption) && (
				<TableFooter>
					{hiddenCount > 0 ? (
						<>
							<MutedText data-testid="table-row-count">
								Showing {shown.length} of {sorted.length}
							</MutedText>
							<Button
								$variant="ghost"
								type="button"
								onClick={() => setVisible((v) => v + (pageSize ?? 25))}
								data-testid="table-show-more"
							>
								Show {Math.min(pageSize ?? 25, hiddenCount)} more
							</Button>
						</>
					) : (
						<span />
					)}
					{caption ? <MutedText>{caption}</MutedText> : null}
				</TableFooter>
			)}
		</div>
	);
}
