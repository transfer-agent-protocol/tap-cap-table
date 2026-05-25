import { useState } from "react";
import { FieldGroup, FieldRow, FieldLabel, SectionLabel, Input, Select, Divider } from "./forms";
import { MintButton } from "./buttons";
import type { StakeholderData } from "../services/createStakeholder";

interface Props {
	onSubmit: (data: StakeholderData) => Promise<void>;
	disabled?: boolean;
}

const defaultData: StakeholderData = {
	name: { legal_name: "Alex Palmer" },
	stakeholder_type: "INDIVIDUAL",
	current_relationship: "FOUNDER",
	issuer_assigned_id: "",
};

export function StakeholderForm({ onSubmit, disabled }: Props) {
	const [data, setData] = useState<StakeholderData>(defaultData);
	const [submitting, setSubmitting] = useState(false);

	const update = <K extends keyof StakeholderData>(key: K, value: StakeholderData[K]) => {
		setData((d) => ({ ...d, [key]: value }));
	};

	const updateName = (legal_name: string) => {
		setData((d) => ({ ...d, name: { ...d.name, legal_name } }));
	};

	const handleSubmit = async () => {
		setSubmitting(true);
		try {
			await onSubmit(data);
		} finally {
			setSubmitting(false);
		}
	};

	const isBusy = disabled || submitting;

	return (
		<div>
			<SectionLabel>Create Stakeholder</SectionLabel>
			<FieldGroup>
				<FieldLabel>Legal Name</FieldLabel>
				<Input value={data.name.legal_name} onChange={(e) => updateName(e.target.value)} disabled={isBusy} />
			</FieldGroup>

			<FieldRow>
				<FieldGroup>
					<FieldLabel>Type</FieldLabel>
					<Select
						value={data.stakeholder_type}
						onChange={(e) => update("stakeholder_type", e.target.value as "INDIVIDUAL" | "INSTITUTION")}
						disabled={isBusy}
					>
						<option value="INDIVIDUAL">INDIVIDUAL</option>
						<option value="INSTITUTION">INSTITUTION</option>
					</Select>
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Relationship</FieldLabel>
					<Input value={data.current_relationship} onChange={(e) => update("current_relationship", e.target.value)} disabled={isBusy} />
				</FieldGroup>
			</FieldRow>

			<Divider />
			<MintButton onClick={handleSubmit} disabled={isBusy || !data.name.legal_name}>
				{submitting ? "Creating..." : "Create Stakeholder"}
			</MintButton>
		</div>
	);
}
