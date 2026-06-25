import { useState } from "react";
import { FieldGroup, FieldRow, FieldLabel, SectionLabel, Input, Divider } from "./forms";
import { MintButton } from "./buttons";
import type { StockIssuanceData } from "../services/createStockIssuance";

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
		<div>
			<SectionLabel>Issue Stock</SectionLabel>
			{disabled && hint ? <p style={{ opacity: 0.6, fontSize: "0.85rem", margin: "0 0 0.5rem" }}>{hint}</p> : null}

			<FieldRow>
				<FieldGroup>
					<FieldLabel>Stakeholder</FieldLabel>
					<select
						value={stakeholderId}
						onChange={(e) => setStakeholderId(e.target.value)}
						disabled={isBusy}
						style={{ padding: "0.5rem", fontFamily: "inherit", width: "100%" }}
					>
						<option value="">Select stakeholder...</option>
						{stakeholders.map((s) => {
							const name = typeof s.name === "object" && s.name ? (s.name as any).legal_name : s.name;
							return (
								<option key={s._id} value={s._id}>
									{name || s.label || s._id}
								</option>
							);
						})}
					</select>
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Stock Class</FieldLabel>
					<select
						value={stockClassId}
						onChange={(e) => setStockClassId(e.target.value)}
						disabled={isBusy}
						style={{ padding: "0.5rem", fontFamily: "inherit", width: "100%" }}
					>
						<option value="">Select class...</option>
						{stockClasses.map((c) => {
							const name = typeof c.name === "object" && c.name ? (c.name as any) : c.name;
							return (
								<option key={c._id} value={c._id}>
									{name || c.label || c._id}
								</option>
							);
						})}
					</select>
				</FieldGroup>
			</FieldRow>

			<FieldRow>
				<FieldGroup>
					<FieldLabel>Quantity</FieldLabel>
					<Input value={data.quantity} onChange={(e) => setData((d) => ({ ...d, quantity: e.target.value }))} disabled={isBusy} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Price / Share (USD)</FieldLabel>
					<Input value={data.share_price.amount} onChange={(e) => updatePrice(e.target.value)} disabled={isBusy} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Custom ID</FieldLabel>
					<Input value={data.custom_id || ""} onChange={(e) => setData((d) => ({ ...d, custom_id: e.target.value }))} disabled={isBusy} />
				</FieldGroup>
			</FieldRow>

			<Divider />
			<MintButton onClick={handleSubmit} disabled={isBusy || !canSubmit}>
				{submitting ? "Issuing..." : "Issue Stock"}
			</MintButton>
		</div>
	);
}
