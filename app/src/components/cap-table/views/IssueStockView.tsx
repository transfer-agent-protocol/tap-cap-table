import type { ReactNode } from "react";
import { Section, SectionHeader, Stack } from "../../layout";
import { StatusMessage } from "../../elements";
import { H3, MutedText } from "../../typography";
import { IssueStockForm } from "../forms/IssueStockForm";
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
		<Stack $gap="xl" data-testid="view-issue-stock">
			<Section>
				<SectionHeader>
					<div>
						<H3>{copy.issueStock.title}</H3>
						<MutedText style={{ marginTop: "0.35rem" }}>
							Grant shares to a shareholder
						</MutedText>
					</div>
					{toolbar}
				</SectionHeader>
				{syncNote && <StatusMessage $variant="pending">{syncNote}</StatusMessage>}
				<Section>
					<IssueStockForm
						stockClasses={stockClasses}
						stakeholders={stakeholders}
						onSubmit={onSubmit}
						disabled={disabled}
						hint={hint}
					/>
				</Section>
			</Section>
		</Stack>
	);
}
