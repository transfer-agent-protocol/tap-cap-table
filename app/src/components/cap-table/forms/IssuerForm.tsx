import { Field, FieldRow, FieldLabel, TextInput } from "../../forms";
import { Divider } from "../../elements";
import { H3 } from "../../typography";
import type { IssuerFormFields } from "../../../hooks/useMintIssuer";

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
			<Field>
				<FieldLabel>Legal Name *</FieldLabel>
				<TextInput value={fields.legalName} onChange={(e) => setField("legalName", e.target.value)} disabled={disabled} />
			</Field>

			<FieldRow>
				<Field>
					<FieldLabel>Formation Date *</FieldLabel>
					<TextInput type="date" value={fields.formationDate} onChange={(e) => setField("formationDate", e.target.value)} disabled={disabled} />
				</Field>
				<Field>
					<FieldLabel>Country *</FieldLabel>
					<TextInput value={fields.countryOfFormation} onChange={upper((v) => setField("countryOfFormation", v))} maxLength={2} disabled={disabled} />
				</Field>
				<Field>
					<FieldLabel>State / Subdivision</FieldLabel>
					<TextInput value={fields.subdivision} onChange={upper((v) => setField("subdivision", v))} disabled={disabled} />
				</Field>
			</FieldRow>

			<Field>
				<FieldLabel>Initial Shares Authorized *</FieldLabel>
				<TextInput type="number" min="1" value={fields.sharesAuthorized} onChange={(e) => setField("sharesAuthorized", e.target.value)} disabled={disabled} />
			</Field>

			<Divider />

			<H3>Tax ID</H3>
			<FieldRow>
				<Field>
					<FieldLabel>Tax ID</FieldLabel>
					<TextInput value={fields.taxId} onChange={(e) => setField("taxId", e.target.value)} disabled={disabled} />
				</Field>
				<Field>
					<FieldLabel>Country</FieldLabel>
					<TextInput value={fields.taxCountry} onChange={upper((v) => setField("taxCountry", v))} maxLength={2} disabled={disabled} />
				</Field>
			</FieldRow>

			<H3>Email</H3>
			<FieldRow>
				<Field>
					<FieldLabel>Email Address</FieldLabel>
					<TextInput type="email" value={fields.emailAddress} onChange={(e) => setField("emailAddress", e.target.value)} disabled={disabled} />
				</Field>
				<Field>
					<FieldLabel>Type</FieldLabel>
					<TextInput value={fields.emailType} onChange={upper((v) => setField("emailType", v))} disabled={disabled} />
				</Field>
			</FieldRow>

			<H3>Address</H3>
			<Field>
				<FieldLabel>Street / Suite</FieldLabel>
				<TextInput value={fields.streetSuite} onChange={(e) => setField("streetSuite", e.target.value)} disabled={disabled} />
			</Field>
			<FieldRow>
				<Field>
					<FieldLabel>City</FieldLabel>
					<TextInput value={fields.city} onChange={(e) => setField("city", e.target.value)} disabled={disabled} />
				</Field>
				<Field>
					<FieldLabel>State</FieldLabel>
					<TextInput value={fields.addressSubdivision} onChange={upper((v) => setField("addressSubdivision", v))} disabled={disabled} />
				</Field>
			</FieldRow>
			<FieldRow>
				<Field>
					<FieldLabel>Country</FieldLabel>
					<TextInput value={fields.addressCountry} onChange={upper((v) => setField("addressCountry", v))} maxLength={2} disabled={disabled} />
				</Field>
				<Field>
					<FieldLabel>Postal Code</FieldLabel>
					<TextInput value={fields.postalCode} onChange={(e) => setField("postalCode", e.target.value)} disabled={disabled} />
				</Field>
				<Field>
					<FieldLabel>Address Type</FieldLabel>
					<TextInput value={fields.addressType} onChange={upper((v) => setField("addressType", v))} disabled={disabled} />
				</Field>
			</FieldRow>
		</>
	);
}
