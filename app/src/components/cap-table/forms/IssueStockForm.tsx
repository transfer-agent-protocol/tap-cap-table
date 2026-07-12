import { useState } from "react";
import { Form, Field, FieldRow, FieldLabel, TextInput, Select } from "../../forms";
import { Button, Divider } from "../../elements";
import type { StockIssuanceData } from "../../../services/createStockIssuance";
import { copy } from "../../../lib/copy";

interface Option {
	_id: string;
	name?: string | { legal_name?: string };
	label?: string;
}

interface Props {
	stockClasses: Option[];
	stakeholders: Option[];
	onSubmit: (data: StockIssuanceData) => Promise<void>;
	disabled?: boolean;
	hint?: string;
}

const defaultData: Omit<StockIssuanceData, "stakeholder_id" | "stock_class_id"> = {
	quantity: "100000",
	share_price: { currency: "USD", amount: "4.20" },
	stock_legend_ids: [],
	custom_id: "CS-A-001",
	security_law_exemptions: [],
	comments: ["Founder stock issuance"],
};

export function IssueStockForm({ stockClasses, stakeholders, onSubmit, disabled, hint }: Props) {
	const [stakeholderId, setStakeholderId] = useState("");
	const [stockClassId, setStockClassId] = useState("");
	const [data, setData] = useState(defaultData);
	const [submitting, setSubmitting] = useState(false);

	const updatePrice = (amount: string) => {
		setData((d) => ({ ...d, share_price: { ...d.share_price, amount } }));
	};

	const handleSubmit = async () => {
		if (!stakeholderId || !stockClassId) return;
		setSubmitting(true);
		try {
			const full: StockIssuanceData = {
				...data,
				stakeholder_id: stakeholderId,
				stock_class_id: stockClassId,
			};
			await onSubmit(full);
		} finally {
			setSubmitting(false);
		}
	};

	const isBusy = disabled || submitting;
	const canSubmit = !!stakeholderId && !!stockClassId && !!data.quantity;

	return (
		<Form as="div">
			{disabled && hint ? (
				<p style={{ opacity: 0.75, fontSize: "0.85rem", margin: "0 0 0.75rem" }}>{hint}</p>
			) : null}

			<FieldRow>
				<Field>
					<FieldLabel>Shareholder</FieldLabel>
					<Select
						value={stakeholderId}
						onChange={(e) => setStakeholderId(e.target.value)}
						disabled={isBusy}
					>
						<option value="">Select shareholder…</option>
						{stakeholders.map((s) => {
							const name =
								typeof s.name === "object" && s.name ? (s.name as any).legal_name : s.name;
							return (
								<option key={s._id} value={s._id}>
									{name || s.label || s._id}
								</option>
							);
						})}
					</Select>
				</Field>
				<Field>
					<FieldLabel>Stock class</FieldLabel>
					<Select
						value={stockClassId}
						onChange={(e) => setStockClassId(e.target.value)}
						disabled={isBusy}
					>
						<option value="">Select stock class…</option>
						{stockClasses.map((c) => {
							const name = typeof c.name === "object" && c.name ? (c.name as any) : c.name;
							return (
								<option key={c._id} value={c._id}>
									{name || c.label || c._id}
								</option>
							);
						})}
					</Select>
				</Field>
			</FieldRow>

			<FieldRow>
				<Field>
					<FieldLabel>Shares</FieldLabel>
					<TextInput
						value={data.quantity}
						onChange={(e) => setData((d) => ({ ...d, quantity: e.target.value }))}
						disabled={isBusy}
					/>
				</Field>
				<Field>
					<FieldLabel>Price per share (USD)</FieldLabel>
					<TextInput
						value={data.share_price.amount}
						onChange={(e) => updatePrice(e.target.value)}
						disabled={isBusy}
					/>
				</Field>
				<Field>
					<FieldLabel>Certificate ID</FieldLabel>
					<TextInput
						value={data.custom_id || ""}
						onChange={(e) => setData((d) => ({ ...d, custom_id: e.target.value }))}
						disabled={isBusy}
						placeholder="CS-001"
					/>
				</Field>
			</FieldRow>

			<Divider />
			<Button $variant="primary" onClick={handleSubmit} disabled={isBusy || !canSubmit}>
				{submitting ? "Confirm in wallet…" : copy.issueStock.title}
			</Button>
		</Form>
	);
}
