import type { ReactNode } from "react";
import {
	DataBand,
	FormBand,
	MutedText,
	PageLayout,
	SectionActions,
	SectionHeader,
	StatusBox,
	StyledTable,
	TableScroll,
	TableTitle,
} from "../../wrappers";
import { InlineButton } from "../../buttons";
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
				<TableScroll>
					<StyledTable>
						<thead>
							<tr>
								<th>Name</th>
								<th>Type</th>
								<th>Authorized</th>
								<th>Status</th>
								<th>Transaction</th>
							</tr>
						</thead>
						<tbody>
							{stockClasses.length === 0 ? (
								<tr>
									<td colSpan={5}>
										<MutedText>{copy.stockClasses.empty}</MutedText>
									</td>
								</tr>
							) : (
								stockClasses.map((sc: any) => {
									const session = sessionClasses.find((d) => d._id === sc._id);
									const live =
										session?.onchain ||
										sc.is_onchain_synced === true ||
										(sc.is_onchain_synced !== false && !session);
									const tx = txForClass(sc, activityLog);
									return (
										<tr key={sc._id}>
											<td>{sc.name || "—"}</td>
											<td>{formatClassType(sc.class_type)}</td>
											<td>
												{sc.initial_shares_authorized ?? sc.shares_authorized ?? "—"}
											</td>
											<td>
												{live ? copy.stockClasses.live : copy.stockClasses.notLive}
											</td>
											<td>
												{tx ? (
													<a
														href={EXPLORER_TX(tx)}
														target="_blank"
														rel="noopener noreferrer"
														title={tx}
													>
														{shortTx(tx)}
													</a>
												) : (
													"—"
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</StyledTable>
				</TableScroll>
			</DataBand>
		</PageLayout>
	);
}
