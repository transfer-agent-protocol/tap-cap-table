import { useState } from "react";
import { Form, Field, FieldRow, FieldLabel, TextInput, Select } from "../../forms";
import { Button, Divider } from "../../elements";
import { SectionActions } from "../../layout";
import type { StakeholderData } from "../../../services/createStakeholder";
import { copy } from "../../../lib/copy";

interface Props {
	onSubmit: (data: StakeholderData) => Promise<void>;
	onCancel?: () => void;
	disabled?: boolean;
	/** Hide the big section label when embedded under a table header */
	compact?: boolean;
}

const defaultData: StakeholderData = {
	name: { legal_name: "" },
	stakeholder_type: "INDIVIDUAL",
	current_relationship: "FOUNDER",
	issuer_assigned_id: "",
};

export function StakeholderForm({ onSubmit, onCancel, disabled, compact }: Props) {
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
			setData(defaultData);
		} finally {
			setSubmitting(false);
		}
	};

	const isBusy = disabled || submitting;

	return (
		<Form as="div">
			<Field>
				<FieldLabel>Legal name</FieldLabel>
				<TextInput
					value={data.name.legal_name}
					onChange={(e) => updateName(e.target.value)}
					disabled={isBusy}
					placeholder="e.g. Alex Palmer"
					autoFocus={compact}
				/>
			</Field>

			<FieldRow>
				<Field>
					<FieldLabel>Type</FieldLabel>
					<Select
						value={data.stakeholder_type}
						onChange={(e) => update("stakeholder_type", e.target.value as "INDIVIDUAL" | "INSTITUTION")}
						disabled={isBusy}
					>
						<option value="INDIVIDUAL">Individual</option>
						<option value="INSTITUTION">Institution</option>
					</Select>
				</Field>
				<Field>
					<FieldLabel>Relationship</FieldLabel>
					<Select
						value={data.current_relationship}
						onChange={(e) => update("current_relationship", e.target.value)}
						disabled={isBusy}
					>
						<option value="FOUNDER">Founder</option>
						<option value="EMPLOYEE">Employee</option>
						<option value="INVESTOR">Investor</option>
						<option value="ADVISOR">Advisor</option>
						<option value="BOARD_MEMBER">Board member</option>
						<option value="OTHER">Other</option>
					</Select>
				</Field>
			</FieldRow>

			<Divider />
			<SectionActions>
				<Button
					$variant="primary"
					onClick={handleSubmit}
					disabled={isBusy || !data.name.legal_name.trim()}
				>
					{submitting ? copy.shareholders.creating : copy.shareholders.create}
				</Button>
				{onCancel && (
					<Button type="button" onClick={onCancel} disabled={isBusy} $variant="ghost">
						{copy.shareholders.cancel}
					</Button>
				)}
			</SectionActions>
		</Form>
	);
}
