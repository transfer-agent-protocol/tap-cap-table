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
import { StakeholderForm } from "../../StakeholderForm";
import { copy, shortTx } from "../../../lib/copy";
import type { StakeholderData } from "../../../services/createStakeholder";
import { EXPLORER_TX, type ActivityEntry } from "../../../utils/activityLog";
import { formatRelationship, formatStakeholderType } from "../types";

interface ShareholdersViewProps {
	stakeholders: any[];
	activityLog: ActivityEntry[];
	isLoading: boolean;
	syncNote: string | null;
	adding: boolean;
	onAddingChange: (v: boolean) => void;
	onSubmit: (data: StakeholderData) => Promise<void>;
	toolbar: ReactNode;
}

/** Resolve explorer TX for a shareholder: Mongo tx_hash, else activity log by entity id. */
function txForStakeholder(sh: any, activityLog: ActivityEntry[]): string | undefined {
	if (typeof sh.tx_hash === "string" && sh.tx_hash.startsWith("0x")) return sh.tx_hash;
	const id = sh._id as string | undefined;
	if (!id) return undefined;
	const hit = activityLog.find(
		(e) =>
			e.kind === "stakeholder" &&
			e.txHash &&
			(e.id.includes(id) || e.details === (sh.name?.legal_name || "")),
	);
	return hit?.txHash;
}

export function ShareholdersView({
	stakeholders,
	activityLog,
	isLoading,
	syncNote,
	adding,
	onAddingChange,
	onSubmit,
	toolbar,
}: ShareholdersViewProps) {
	return (
		<PageLayout data-testid="view-stakeholders">
			<DataBand>
				<SectionHeader>
					<div>
						<TableTitle>{copy.shareholders.title}</TableTitle>
						<MutedText style={{ marginTop: "0.35rem" }}>
							{stakeholders.length} shareholder{stakeholders.length === 1 ? "" : "s"}
						</MutedText>
					</div>
					<SectionActions>
						{!adding && (
							<InlineButton
								onClick={() => onAddingChange(true)}
								$variant="primary"
								disabled={isLoading}
							>
								{copy.shareholders.add}
							</InlineButton>
						)}
						{toolbar}
					</SectionActions>
				</SectionHeader>
				{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
				{adding && (
					<FormBand style={{ marginBottom: "1rem" }}>
						<StakeholderForm
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
								<th>Relationship</th>
								<th>Transaction</th>
							</tr>
						</thead>
						<tbody>
							{stakeholders.length === 0 ? (
								<tr>
									<td colSpan={4}>
										<MutedText>{copy.shareholders.empty}</MutedText>
									</td>
								</tr>
							) : (
								stakeholders.map((sh: any) => {
									const tx = txForStakeholder(sh, activityLog);
									return (
										<tr key={sh._id}>
											<td>{sh.name?.legal_name || sh.name?.first_name || "—"}</td>
											<td>{formatStakeholderType(sh.stakeholder_type)}</td>
											<td>{formatRelationship(sh.current_relationship)}</td>
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
