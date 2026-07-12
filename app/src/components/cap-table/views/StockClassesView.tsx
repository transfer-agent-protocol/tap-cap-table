import type { ReactNode } from "react";
import { Section, SectionActions, SectionHeader, Stack } from "../../layout";
import { Button, StatusMessage } from "../../elements";
import { H3, MutedText } from "../../typography";
import { DataTable, type Column } from "../../DataTable";
import { StockClassForm } from "../forms/StockClassForm";
import { copy, shortTx } from "../../../lib/copy";
import type { StockClassData } from "../../../services/createStockClass";
import { EXPLORER_TX, type ActivityEntry } from "../../../utils/activityLog";
import { formatClassType, type OptimisticStockClass } from "../types";

interface StockClassesViewProps {
	stockClasses: any[];
	sessionClasses: OptimisticStockClass[];
	activityLog: ActivityEntry[];
	ghostClassCount: number;
	isLoading: boolean;
	syncNote: string | null;
	adding: boolean;
	onAddingChange: (v: boolean) => void;
	onSubmit: (data: StockClassData) => Promise<void>;
	toolbar: ReactNode;
	/** Current positions — drives the per-class Issued column */
	holdings?: Array<{ stockClass?: { _id?: string }; quantity?: number | string }>;
}

interface ClassRow {
	key: string;
	name: string;
	type: string;
	authorized: string;
	issued: string;
	status: string;
	tx: ReactNode;
}

function txForClass(sc: any, activityLog: ActivityEntry[]): string | undefined {
	if (typeof sc.tx_hash === "string" && sc.tx_hash.startsWith("0x")) return sc.tx_hash;
	const id = sc._id as string | undefined;
	if (!id) return undefined;
	const hit = activityLog.find(
		(e) =>
			e.kind === "stock_class" &&
			e.txHash &&
			(e.id.includes(id) || e.details === sc.name),
	);
	return hit?.txHash;
}

function renderTx(tx: string | undefined): ReactNode {
	if (!tx) return "—";
	return (
		<a href={EXPLORER_TX(tx)} target="_blank" rel="noopener noreferrer" title={tx}>
			{shortTx(tx)}
		</a>
	);
}

const columns: Column<ClassRow>[] = [
	{ key: "name", header: "Name", width: "22%", render: (r) => r.name },
	{ key: "type", header: "Type", width: "12%", render: (r) => r.type },
	{
		key: "authorized",
		header: "Authorized",
		align: "right",
		width: "15%",
		render: (r) => r.authorized,
	},
	{
		key: "issued",
		header: "Issued",
		align: "right",
		width: "15%",
		render: (r) => r.issued,
	},
	{ key: "status", header: "Status", width: "12%", render: (r) => r.status },
	{ key: "tx", header: "Transaction", width: "16%", render: (r) => r.tx },
];

export function StockClassesView({
	stockClasses,
	sessionClasses,
	activityLog,
	ghostClassCount,
	isLoading,
	syncNote,
	adding,
	onAddingChange,
	onSubmit,
	toolbar,
	holdings = [],
}: StockClassesViewProps) {
	// Issued per class from current positions
	const issuedByClass = new Map<string, number>();
	for (const h of holdings) {
		const id = h.stockClass?._id;
		const qty = Number(h.quantity);
		if (!id || !Number.isFinite(qty) || qty <= 0) continue;
		issuedByClass.set(id, (issuedByClass.get(id) || 0) + qty);
	}

	const rows: ClassRow[] = stockClasses.map((sc: any) => {
		const session = sessionClasses.find((d) => d._id === sc._id);
		const live =
			session?.onchain ||
			sc.is_onchain_synced === true ||
			(sc.is_onchain_synced !== false && !session);
		const authorized = sc.initial_shares_authorized ?? sc.shares_authorized;
		const issued = issuedByClass.get(sc._id) || 0;
		return {
			key: sc._id,
			name: sc.name || "—",
			type: formatClassType(sc.class_type),
			authorized:
				authorized != null && authorized !== ""
					? Number(authorized).toLocaleString()
					: "—",
			issued: issued > 0 ? issued.toLocaleString() : "—",
			status: live ? copy.stockClasses.live : copy.stockClasses.notLive,
			tx: renderTx(txForClass(sc, activityLog)),
		};
	});

	return (
		<Stack $gap="xl" data-testid="view-stock-classes">
			<Section>
				<SectionHeader>
					<div>
						<H3>{copy.stockClasses.title}</H3>
						<MutedText style={{ marginTop: "0.35rem" }}>
							{stockClasses.length} class{stockClasses.length === 1 ? "" : "es"}
							{ghostClassCount > 0 ? ` · ${ghostClassCount} not ready` : ""}
						</MutedText>
					</div>
					<SectionActions>
						{!adding && (
							<Button
								onClick={() => onAddingChange(true)}
								$variant="primary"
								disabled={isLoading}
							>
								{copy.stockClasses.add}
							</Button>
						)}
						{toolbar}
					</SectionActions>
				</SectionHeader>
				{syncNote && <StatusMessage $variant="pending">{syncNote}</StatusMessage>}
				{adding && (
					<Section style={{ marginBottom: "1rem" }}>
						<StockClassForm
							compact
							onSubmit={async (data) => {
								await onSubmit(data);
								onAddingChange(false);
							}}
							onCancel={() => onAddingChange(false)}
							disabled={isLoading}
						/>
					</Section>
				)}
				<DataTable<ClassRow>
					aria-label={copy.stockClasses.title}
					columns={columns}
					rows={rows}
					rowKey={(r) => r.key}
					isLoading={isLoading}
					emptyMessage={copy.stockClasses.empty}
				/>
			</Section>
		</Stack>
	);
}
