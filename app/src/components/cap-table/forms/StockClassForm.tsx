import { useState } from "react";
import { Form, Field, FieldRow, FieldLabel, TextInput, Select } from "../../forms";
import { Button, Divider } from "../../elements";
import { SectionActions } from "../../layout";
import type { StockClassData } from "../../../services/createStockClass";
import { copy } from "../../../lib/copy";

interface Props {
	onSubmit: (data: StockClassData) => Promise<void>;
	onCancel?: () => void;
	disabled?: boolean;
	compact?: boolean;
}

const defaultData: StockClassData = {
	name: "Common",
	class_type: "COMMON",
	default_id_prefix: "CS",
	initial_shares_authorized: "10000000",
	votes_per_share: "1",
	price_per_share: { currency: "USD", amount: "0.00001" },
	seniority: "1",
};

export function StockClassForm({ onSubmit, onCancel, disabled, compact }: Props) {
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
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Form as="div">
			<Field>
				<FieldLabel>Name</FieldLabel>
				<TextInput
					value={data.name}
					onChange={(e) => update("name", e.target.value)}
					disabled={isBusy}
					placeholder="e.g. Common"
					autoFocus={compact}
				/>
			</Field>

			<FieldRow>
				<Field>
					<FieldLabel>Type</FieldLabel>
					<Select
						value={data.class_type}
						onChange={(e) => update("class_type", e.target.value as "COMMON" | "PREFERRED")}
						disabled={isBusy}
					>
						<option value="COMMON">Common</option>
						<option value="PREFERRED">Preferred</option>
					</Select>
				</Field>
				<Field>
					<FieldLabel>Certificate prefix</FieldLabel>
					<TextInput
						value={data.default_id_prefix}
						onChange={(e) => update("default_id_prefix", e.target.value)}
						disabled={isBusy}
						placeholder="CS"
					/>
				</Field>
			</FieldRow>

			<FieldRow>
				<Field>
					<FieldLabel>Shares authorized</FieldLabel>
					<TextInput
						value={data.initial_shares_authorized}
						onChange={(e) => update("initial_shares_authorized", e.target.value)}
						disabled={isBusy}
					/>
				</Field>
				<Field>
					<FieldLabel>Votes per share</FieldLabel>
					<TextInput
						value={data.votes_per_share}
						onChange={(e) => update("votes_per_share", e.target.value)}
						disabled={isBusy}
					/>
				</Field>
				<Field>
					<FieldLabel>Price per share (USD)</FieldLabel>
					<TextInput
						value={data.price_per_share.amount}
						onChange={(e) => updatePrice(e.target.value)}
						disabled={isBusy}
					/>
				</Field>
			</FieldRow>

			<Divider />
			<SectionActions>
				<Button
					$variant="primary"
					onClick={handleSubmit}
					disabled={isBusy || !data.name.trim() || !data.initial_shares_authorized}
				>
					{submitting ? copy.stockClasses.creating : copy.stockClasses.create}
				</Button>
				{onCancel && (
					<Button type="button" onClick={onCancel} disabled={isBusy} $variant="ghost">
						{copy.stockClasses.cancel}
					</Button>
				)}
			</SectionActions>
		</Form>
	);
}
