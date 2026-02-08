import { FieldGroup, FieldRow, FieldLabel, SectionLabel, Input, Divider } from "./forms";
import type { IssuerFormFields } from "../hooks/useMintIssuer";

export interface IssuerFormProps {
	fields: IssuerFormFields;
	setField: <K extends keyof IssuerFormFields>(key: K, value: IssuerFormFields[K]) => void;
	disabled: boolean;
}

export function IssuerForm({ fields, setField, disabled }: IssuerFormProps) {
	const upper = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
		fn(e.target.value.toUpperCase());

	return (
		<>
			<FieldGroup>
				<FieldLabel>Legal Name *</FieldLabel>
				<Input value={fields.legalName} onChange={(e) => setField("legalName", e.target.value)} disabled={disabled} />
			</FieldGroup>

			<FieldRow>
				<FieldGroup>
					<FieldLabel>Formation Date *</FieldLabel>
					<Input type="date" value={fields.formationDate} onChange={(e) => setField("formationDate", e.target.value)} disabled={disabled} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Country *</FieldLabel>
					<Input value={fields.countryOfFormation} onChange={upper((v) => setField("countryOfFormation", v))} maxLength={2} disabled={disabled} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>State / Subdivision</FieldLabel>
					<Input value={fields.subdivision} onChange={upper((v) => setField("subdivision", v))} disabled={disabled} />
				</FieldGroup>
			</FieldRow>

			<FieldGroup>
				<FieldLabel>Initial Shares Authorized *</FieldLabel>
				<Input type="number" min="1" value={fields.sharesAuthorized} onChange={(e) => setField("sharesAuthorized", e.target.value)} disabled={disabled} />
			</FieldGroup>

			<Divider />

			<SectionLabel>Tax ID</SectionLabel>
			<FieldRow>
				<FieldGroup>
					<FieldLabel>Tax ID</FieldLabel>
					<Input value={fields.taxId} onChange={(e) => setField("taxId", e.target.value)} disabled={disabled} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Country</FieldLabel>
					<Input value={fields.taxCountry} onChange={upper((v) => setField("taxCountry", v))} maxLength={2} disabled={disabled} />
				</FieldGroup>
			</FieldRow>

			<SectionLabel>Email</SectionLabel>
			<FieldRow>
				<FieldGroup>
					<FieldLabel>Email Address</FieldLabel>
					<Input type="email" value={fields.emailAddress} onChange={(e) => setField("emailAddress", e.target.value)} disabled={disabled} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Type</FieldLabel>
					<Input value={fields.emailType} onChange={upper((v) => setField("emailType", v))} disabled={disabled} />
				</FieldGroup>
			</FieldRow>

			<SectionLabel>Address</SectionLabel>
			<FieldGroup>
				<FieldLabel>Street / Suite</FieldLabel>
				<Input value={fields.streetSuite} onChange={(e) => setField("streetSuite", e.target.value)} disabled={disabled} />
			</FieldGroup>
			<FieldRow>
				<FieldGroup>
					<FieldLabel>City</FieldLabel>
					<Input value={fields.city} onChange={(e) => setField("city", e.target.value)} disabled={disabled} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>State</FieldLabel>
					<Input value={fields.addressSubdivision} onChange={upper((v) => setField("addressSubdivision", v))} disabled={disabled} />
				</FieldGroup>
			</FieldRow>
			<FieldRow>
				<FieldGroup>
					<FieldLabel>Country</FieldLabel>
					<Input value={fields.addressCountry} onChange={upper((v) => setField("addressCountry", v))} maxLength={2} disabled={disabled} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Postal Code</FieldLabel>
					<Input value={fields.postalCode} onChange={(e) => setField("postalCode", e.target.value)} disabled={disabled} />
				</FieldGroup>
				<FieldGroup>
					<FieldLabel>Address Type</FieldLabel>
					<Input value={fields.addressType} onChange={upper((v) => setField("addressType", v))} disabled={disabled} />
				</FieldGroup>
			</FieldRow>
		</>
	);
}
