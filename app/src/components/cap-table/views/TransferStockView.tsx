import type { ReactNode } from "react";
import { Section, SectionHeader, Stack } from "../../layout";
import { StatusMessage } from "../../elements";
import { H3, MutedText } from "../../typography";
import { TransferStockForm, type TransferStockFormData } from "../forms/TransferStockForm";
import { copy } from "../../../lib/copy";

interface TransferStockViewProps {
	stakeholders: any[];
	stockClasses: any[];
	holdings: any[];
	isLoading: boolean;
	syncNote: string | null;
	onSubmit: (data: TransferStockFormData) => Promise<void>;
	toolbar: ReactNode;
}

export function TransferStockView({
	stakeholders,
	stockClasses,
	holdings,
	isLoading,
	syncNote,
	onSubmit,
	toolbar,
}: TransferStockViewProps) {
	const hasPositions = holdings.some((h) => Number(h.quantity) > 0);
	const canTransfer = hasPositions && stakeholders.length >= 2;

	let hint: string | undefined;
	if (!isLoading && stakeholders.length < 2) {
		hint = copy.transfer.needsPeople;
	} else if (!isLoading && !hasPositions) {
		hint = copy.transfer.needsHoldings;
	}

	return (
		<Stack $gap="xl" data-testid="view-transfer-stock">
			<Section>
				<SectionHeader>
					<div>
						<H3>{copy.transfer.title}</H3>
						<MutedText style={{ marginTop: "0.35rem" }}>
							Move shares from one shareholder to another
						</MutedText>
					</div>
					{toolbar}
				</SectionHeader>
				{syncNote && <StatusMessage $variant="pending">{syncNote}</StatusMessage>}
				<Section>
					<TransferStockForm
						stakeholders={stakeholders}
						stockClasses={stockClasses}
						holdings={holdings}
						onSubmit={onSubmit}
						disabled={isLoading || !canTransfer}
						hint={hint}
					/>
				</Section>
			</Section>
		</Stack>
	);
}
