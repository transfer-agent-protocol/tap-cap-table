import type { ReactNode } from "react";
import { MutedText, StatusBox, StyledTable, TableScroll } from "./wrappers";

export interface Column<T> {
	key: string;
	header: ReactNode;
	align?: "left" | "right" | "center";
	/** Optional fixed/min width e.g. "8rem" or "12%" */
	width?: string;
	render: (row: T) => ReactNode;
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
}

/**
 * Shared data table for the manage workspace.
 * Always renders one explicit state: error, first-load, empty, or rows.
 * Styling comes from `StyledTable` / `TableScroll` so every list looks the same.
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
}: DataTableProps<T>) {
	const span = columns.length;

	return (
		<div style={{ width: "100%" }}>
			<TableScroll>
				<StyledTable aria-label={ariaLabel}>
					<thead>
						<tr>
							{columns.map((c) => (
								<th
									key={c.key}
									style={{
										textAlign: c.align ?? "left",
										width: c.width,
									}}
								>
									{c.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{error ? (
							<tr>
								<td colSpan={span} style={{ padding: "1rem" }}>
									<StatusBox $variant="error">{error}</StatusBox>
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
							rows.map((row, i) => (
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
				</StyledTable>
			</TableScroll>
			{caption ? (
				<MutedText style={{ marginTop: "0.5rem" }}>{caption}</MutedText>
			) : null}
		</div>
	);
}
