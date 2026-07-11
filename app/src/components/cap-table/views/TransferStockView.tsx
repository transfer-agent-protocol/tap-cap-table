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
import { TransferStockForm, type TransferStockFormData } from "../../TransferStockForm";
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
		<PageLayout data-testid="view-transfer-stock">
			<DataBand>
				<SectionHeader>
					<div>
						<TableTitle>{copy.transfer.title}</TableTitle>
						<MutedText style={{ marginTop: "0.35rem" }}>
							Move shares from one shareholder to another
						</MutedText>
					</div>
					{toolbar}
				</SectionHeader>
				{syncNote && <StatusBox $variant="pending">{syncNote}</StatusBox>}
				<FormBand>
					<TransferStockForm
						stakeholders={stakeholders}
						stockClasses={stockClasses}
						holdings={holdings}
						onSubmit={onSubmit}
						disabled={isLoading || !canTransfer}
						hint={hint}
					/>
				</FormBand>
			</DataBand>
		</PageLayout>
	);
}
