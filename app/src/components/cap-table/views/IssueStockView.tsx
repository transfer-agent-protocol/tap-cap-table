import type { ReactNode } from "react";
import {
	DataBand,
	FormBand,
	MutedText,
	PageLayout,
	SectionHeader,
	StatusBox,
	TableTitle,
} from "../../wrappers";
import { IssueStockForm } from "../../IssueStockForm";
import { copy } from "../../../lib/copy";
import type { StockIssuanceData } from "../../../services/createStockIssuance";

interface IssueStockViewProps {
	stockClasses: any[];
	stakeholders: any[];
	isLoading: boolean;
	syncNote: string | null;
	onSubmit: (data: StockIssuanceData) => Promise<void>;
	toolbar: ReactNode;
}

export function IssueStockView({
	stockClasses,
	stakeholders,
	isLoading,
	syncNote,
	onSubmit,
	toolbar,
}: IssueStockViewProps) {
	const disabled = isLoading || stockClasses.length === 0 || stakeholders.length === 0;
	const hint =
		!isLoading && stakeholders.length === 0
			? copy.issueStock.needsPeople
			: !isLoading && stockClasses.length === 0
				? copy.issueStock.needsClass
				: undefined;

	return (
		<PageLayout data-testid="view-issue-stock">
			<DataBand>
				<SectionHeader>
					<div>
						<TableTitle>{copy.issueStock.title}</TableTitle>
						<MutedText style={{ marginTop: "0.35rem" }}>
							Grant shares to a shareholder
						</MutedText>
					</div>
					{toolbar}
				</SectionHeader>
				{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
				<FormBand>
					<IssueStockForm
						stockClasses={stockClasses}
						stakeholders={stakeholders}
						onSubmit={onSubmit}
						disabled={disabled}
						hint={hint}
					/>
				</FormBand>
			</DataBand>
		</PageLayout>
	);
}
