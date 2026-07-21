import { useEffect } from "react";

/**
 * Explicit table interface for hand-authored JSX tables. Markdown tables are
 * enhanced by TableEnhancer below so the same responsive behavior applies to
 * the entire existing documentation set.
 *
 * columns: [{ key: string, label: ReactNode }]
 * rows: Array<Record<string, ReactNode>>
 */
export function ResponsiveTable({ columns, rows, compact = columns.length <= 2 }) {
	return (
		<div className={`tap-table-frame${compact ? " tap-table-frame--compact" : ""}`}>
			<table>
				<thead>
					<tr>{columns.map(({ key, label }) => <th key={key}>{label}</th>)}</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIndex) => (
						<tr key={row.id ?? rowIndex}>
							{columns.map(({ key, label }) => (
								<td key={key} data-label={typeof label === "string" ? label : key}>{row[key]}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/** Adds deterministic mobile labels to Nextra's generated Markdown tables. */
export function TableEnhancer() {
	useEffect(() => {
		const enhance = (table) => {
			if (table.dataset.tapResponsive === "true") return;
			const labels = Array.from(table.querySelectorAll("thead th"), (cell) => cell.textContent.trim());
			if (!labels.length) return;

			table.dataset.tapResponsive = "true";
			table.dataset.tapColumns = labels.join("|");
			table.closest("div[class*='overflow-x']")?.classList.add("tap-table-frame");
			table.querySelectorAll("tbody tr").forEach((row) => {
				Array.from(row.cells).forEach((cell, index) => {
					cell.dataset.label = labels[index] || `Column ${index + 1}`;
				});
			});
		};

		const enhanceAll = () => document.querySelectorAll("article table").forEach(enhance);
		enhanceAll();
		const observer = new MutationObserver(enhanceAll);
		observer.observe(document.body, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, []);

	return null;
}
