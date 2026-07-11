import type { ReactNode } from "react";
import {
	DataBand,
	FormBand,
	MutedText,
	PageLayout,
	SectionActions,
	SectionHeader,
	StatusBox,
	TableTitle,
} from "../../wrappers";
import { InlineButton } from "../../buttons";
import { DataTable, type Column } from "../../DataTable";
import { StockClassForm } from "../../StockClassForm";
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
}

interface ClassRow {
	key: string;
	name: string;
	type: string;
	authorized: string;
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
	{ key: "name", header: "Name", width: "24%", render: (r) => r.name },
	{ key: "type", header: "Type", width: "14%", render: (r) => r.type },
	{
		key: "authorized",
		header: "Authorized",
		align: "right",
		width: "16%",
		render: (r) => r.authorized,
	},
	{ key: "status", header: "Status", width: "14%", render: (r) => r.status },
	{ key: "tx", header: "Transaction", width: "18%", render: (r) => r.tx },
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
}: StockClassesViewProps) {
	const rows: ClassRow[] = stockClasses.map((sc: any) => {
		const session = sessionClasses.find((d) => d._id === sc._id);
		const live =
			session?.onchain ||
			sc.is_onchain_synced === true ||
			(sc.is_onchain_synced !== false && !session);
		const authorized = sc.initial_shares_authorized ?? sc.shares_authorized;
		return {
			key: sc._id,
			name: sc.name || "—",
			type: formatClassType(sc.class_type),
			authorized:
				authorized != null && authorized !== ""
					? Number(authorized).toLocaleString()
					: "—",
			status: live ? copy.stockClasses.live : copy.stockClasses.notLive,
			tx: renderTx(txForClass(sc, activityLog)),
		};
	});

	return (
		<PageLayout data-testid="view-stock-classes">
			<DataBand>
				<SectionHeader>
					<div>
						<TableTitle>{copy.stockClasses.title}</TableTitle>
						<MutedText style={{ marginTop: "0.35rem" }}>
							{stockClasses.length} class{stockClasses.length === 1 ? "" : "es"}
							{ghostClassCount > 0 ? ` · ${ghostClassCount} not ready` : ""}
						</MutedText>
					</div>
					<SectionActions>
						{!adding && (
							<InlineButton
								onClick={() => onAddingChange(true)}
								$variant="primary"
								disabled={isLoading}
							>
								{copy.stockClasses.add}
							</InlineButton>
						)}
						{toolbar}
					</SectionActions>
				</SectionHeader>
				{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
				{adding && (
					<FormBand style={{ marginBottom: "1rem" }}>
						<StockClassForm
							compact
							onSubmit={async (data) => {
								await onSubmit(data);
								onAddingChange(false);
							}}
							onCancel={() => onAddingChange(false)}
							disabled={isLoading}
						/>
					</FormBand>
				)}
				<DataTable<ClassRow>
					aria-label={copy.stockClasses.title}
					columns={columns}
					rows={rows}
					rowKey={(r) => r.key}
					isLoading={isLoading}
					emptyMessage={copy.stockClasses.empty}
				/>
			</DataBand>
		</PageLayout>
	);
}
