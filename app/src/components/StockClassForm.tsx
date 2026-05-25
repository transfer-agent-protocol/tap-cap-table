import { useState } from "react";
import { FieldGroup, FieldRow, FieldLabel, SectionLabel, Input, Select, Divider } from "./forms";
import { MintButton } from "./buttons";
import type { StockClassData } from "../services/createStockClass";

interface Props {
	onSubmit: (data: StockClassData) => Promise<void>;
	disabled?: boolean;
}

const defaultData: StockClassData = {
	name: "Series A Common",
	class_type: "COMMON",
	default_id_prefix: "CS-A",
	initial_shares_authorized: "1000000",
	votes_per_share: "1",
	price_per_share: { currency: "USD", amount: "4.20" },
	seniority: "1",
};

export function StockClassForm({ onSubmit, disabled }: Props) {
	const [data, setData] = useState<StockClassData>(defaultData);
	const [submitting, setSubmitting] = useState(false);

	const isBusy = disabled || submitting;

	const update = <K extends keyof StockClassData>(key: K, value: StockClassData[K]) => {
		setData((d) => ({ ...d, [key]: value }));
	};

	const updatePrice = (amount: string) => {
		setData((d) => ({ ...d, price_per_share: { ...d.price_per_share, amount } }));
	};

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await onSubmit(data);
			// keep values for quick successive creates (or reset if preferred)
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			<SectionLabel>Create Stock Class</SectionLabel>
			<FieldGroup>
				<FieldLabel>Name</FieldLabel>
				<Input value={data.name} onChange={(e) => update("name", e.target.value)} disabled={isBusy} />
			</FieldGroup>

			<FieldRow>
				<FieldGroup>
					<FieldLabel>Type</FieldLabel>
					<Select
						value={data.class_type}
						onChange={(e) => update("class_type", e.target.value as "COMMON" | "PREFERRED")}
						disabled={isBusy}
					>
						<option value="COMMON">COMMON</option>
						<option value="PREFERRED">PREFERRED</option>
					</Select>
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>ID Prefix</FieldLabel>
					<Input value={data.default_id_prefix} onChange={(e) => update("default_id_prefix", e.target.value)} disabled={isBusy} />
				</FieldGroup>
			</FieldRow>

			<FieldRow>
				<FieldGroup>
					<FieldLabel>Shares Authorized</FieldLabel>
					<Input value={data.initial_shares_authorized} onChange={(e) => update("initial_shares_authorized", e.target.value)} disabled={isBusy} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Votes / Share</FieldLabel>
					<Input value={data.votes_per_share} onChange={(e) => update("votes_per_share", e.target.value)} disabled={isBusy} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Seniority</FieldLabel>
					<Input value={data.seniority} onChange={(e) => update("seniority", e.target.value)} disabled={isBusy} />
				</FieldGroup>
			</FieldRow>

			<FieldRow>
				<FieldGroup>
					<FieldLabel>Price per Share (USD)</FieldLabel>
					<Input value={data.price_per_share.amount} onChange={(e) => updatePrice(e.target.value)} disabled={isBusy} />
				</FieldGroup>
			</FieldRow>

			<Divider />
			<MintButton onClick={handleSubmit} disabled={isBusy || !data.name || !data.initial_shares_authorized}>
				{submitting ? "Creating..." : "Create Stock Class"}
			</MintButton>
		</div>
	);
}
