import type { ReactNode } from "react";
import { MutedText, StatusBox, StyledTable, TableScroll } from "./wrappers";

export interface Column<T> {
	key: string;
	header: ReactNode;
	align?: "left" | "right" | "center";
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
}

/**
 * Generic table that always renders one explicit state: error, first-load, empty, or rows.
 * This is the key fix for the old hand-rolled tables, where a failed or pending fetch looked
 * identical to "no data". Columns declare how each cell renders; styling reuses the shared
 * `StyledTable` primitives so every table in the app looks and behaves the same.
 */
export function DataTable<T>({
	columns,
	rows,
	rowKey,
	isLoading = false,
	error = null,
	emptyMessage = "Nothing here yet.",
	caption,
}: DataTableProps<T>) {
	const span = columns.length;

	return (
		<TableScroll>
			<StyledTable>
				<thead>
					<tr>
						{columns.map((c) => (
							<th key={c.key} style={{ textAlign: c.align ?? "left" }}>
								{c.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{error ? (
						<tr>
							<td colSpan={span} style={{ padding: 0, borderBottom: "none" }}>
								<StatusBox $variant="error">{error}</StatusBox>
							</td>
						</tr>
					) : isLoading && rows.length === 0 ? (
						<tr>
							<td colSpan={span} style={{ textAlign: "center", opacity: 0.7 }}>
								Loading…
							</td>
						</tr>
					) : rows.length === 0 ? (
						<tr>
							<td colSpan={span} style={{ borderBottom: "none" }}>
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
			{caption ? <MutedText>{caption}</MutedText> : null}
		</TableScroll>
	);
}
