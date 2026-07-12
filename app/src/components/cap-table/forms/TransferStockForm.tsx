import { useMemo, useState } from "react";
import { Form, Field, FieldRow, FieldLabel, TextInput, Select } from "../../forms";
import { Button, Divider } from "../../elements";
import { MutedText } from "../../typography";
import { copy } from "../../../lib/copy";

export interface TransferStockFormData {
	transferor_id: string;
	transferee_id: string;
	stock_class_id: string;
	quantity: string;
	share_price: { currency: string; amount: string };
}

interface HolderOption {
	_id: string;
	name?: string | { legal_name?: string };
}

interface ClassOption {
	_id: string;
	name?: string;
}

interface HoldingRow {
	stakeholder?: { _id?: string; name?: { legal_name?: string } };
	stockClass?: { _id?: string; name?: string };
	quantity?: number | string;
}

interface Props {
	stakeholders: HolderOption[];
	stockClasses: ClassOption[];
	/** Current positions — drives From options and max quantity */
	holdings: HoldingRow[];
	onSubmit: (data: TransferStockFormData) => Promise<void>;
	disabled?: boolean;
	hint?: string;
}

function legalName(h: HolderOption): string {
	if (typeof h.name === "object" && h.name) return h.name.legal_name || h._id;
	return (h.name as string) || h._id;
}

export function TransferStockForm({
	stakeholders,
	stockClasses,
	holdings,
	onSubmit,
	disabled,
	hint,
}: Props) {
	const [fromId, setFromId] = useState("");
	const [toId, setToId] = useState("");
	const [classId, setClassId] = useState("");
	const [quantity, setQuantity] = useState("");
	const [price, setPrice] = useState("0");
	const [submitting, setSubmitting] = useState(false);

	/** Shareholders who currently hold any shares */
	const holdersWithPositions = useMemo(() => {
		const ids = new Set(
			holdings
				.filter((h) => Number(h.quantity) > 0 && h.stakeholder?._id)
				.map((h) => h.stakeholder!._id as string),
		);
		return stakeholders.filter((s) => ids.has(s._id));
	}, [holdings, stakeholders]);

	/** Classes the transferor owns */
	const classesFromOwns = useMemo(() => {
		if (!fromId) return [];
		const classIds = new Set(
			holdings
				.filter(
					(h) =>
						h.stakeholder?._id === fromId &&
						Number(h.quantity) > 0 &&
						h.stockClass?._id,
				)
				.map((h) => h.stockClass!._id as string),
		);
		return stockClasses.filter((c) => classIds.has(c._id));
	}, [fromId, holdings, stockClasses]);

	const maxQty = useMemo(() => {
		if (!fromId || !classId) return 0;
		return holdings
			.filter((h) => h.stakeholder?._id === fromId && h.stockClass?._id === classId)
			.reduce((sum, h) => sum + (Number(h.quantity) || 0), 0);
	}, [fromId, classId, holdings]);

	const toOptions = stakeholders.filter((s) => s._id !== fromId);

	const qtyNum = Number(quantity);
	const overMax = maxQty > 0 && Number.isFinite(qtyNum) && qtyNum > maxQty;
	const canSubmit =
		!!fromId &&
		!!toId &&
		!!classId &&
		qtyNum > 0 &&
		!overMax &&
		fromId !== toId;

	const handleFromChange = (id: string) => {
		setFromId(id);
		setClassId("");
		setQuantity("");
		if (toId === id) setToId("");
	};

	const handleSubmit = async () => {
		if (!canSubmit) return;
		setSubmitting(true);
		try {
			await onSubmit({
				transferor_id: fromId,
				transferee_id: toId,
				stock_class_id: classId,
				quantity: String(qtyNum),
				share_price: { currency: "USD", amount: price || "0" },
			});
		} finally {
			setSubmitting(false);
		}
	};

	const isBusy = disabled || submitting;

	return (
		<Form as="div">
			{hint && (
				<p style={{ opacity: 0.75, fontSize: "0.85rem", margin: "0 0 0.75rem" }}>{hint}</p>
			)}

			<FieldRow>
				<Field>
					<FieldLabel>From</FieldLabel>
					<Select
						value={fromId}
						onChange={(e) => handleFromChange(e.target.value)}
						disabled={isBusy}
					>
						<option value="">Select shareholder…</option>
						{holdersWithPositions.map((s) => (
							<option key={s._id} value={s._id}>
								{legalName(s)}
							</option>
						))}
					</Select>
				</Field>
				<Field>
					<FieldLabel>To</FieldLabel>
					<Select
						value={toId}
						onChange={(e) => setToId(e.target.value)}
						disabled={isBusy || !fromId}
					>
						<option value="">Select shareholder…</option>
						{toOptions.map((s) => (
							<option key={s._id} value={s._id}>
								{legalName(s)}
							</option>
						))}
					</Select>
				</Field>
			</FieldRow>

			<FieldRow>
				<Field>
					<FieldLabel>Stock class</FieldLabel>
					<Select
						value={classId}
						onChange={(e) => {
							setClassId(e.target.value);
							setQuantity("");
						}}
						disabled={isBusy || !fromId}
					>
						<option value="">Select class…</option>
						{classesFromOwns.map((c) => (
							<option key={c._id} value={c._id}>
								{c.name || c._id}
							</option>
						))}
					</Select>
				</Field>
				<Field>
					<FieldLabel>Shares to transfer</FieldLabel>
					<TextInput
						value={quantity}
						onChange={(e) => setQuantity(e.target.value)}
						disabled={isBusy || !classId}
						placeholder={maxQty > 0 ? `Max ${maxQty.toLocaleString()}` : "0"}
					/>
					{classId && (
						<MutedText style={{ marginTop: "0.25rem" }}>
							Available: {maxQty.toLocaleString()}
							{overMax ? " — exceeds balance" : ""}
						</MutedText>
					)}
				</Field>
				<Field>
					<FieldLabel>Price per share (USD)</FieldLabel>
					<TextInput
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						disabled={isBusy}
						placeholder="0"
					/>
				</Field>
			</FieldRow>

			<Divider />
			<Button $variant="primary" onClick={handleSubmit} disabled={isBusy || !canSubmit}>
				{submitting ? "Confirm in wallet…" : copy.transfer.title}
			</Button>
		</Form>
	);
}
