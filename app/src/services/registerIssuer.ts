export interface RegisterIssuerPayload {
	id: string; // bytes16 hex
	legal_name: string;
	formation_date: string;
	country_of_formation: string;
	country_subdivision_of_formation?: string;
	initial_shares_authorized: string;
	tax_ids?: { tax_id: string; country: string }[];
	email?: { email_address: string; email_type: string };
	address?: {
		address_type: string;
		street_suite: string;
		city: string;
		country_subdivision: string;
		country: string;
		postal_code: string;
	};
	comments?: string[];
	deployed_to: string;
	tx_hash: string;
}

export interface IssuerResponse {
	_id: string;
	legal_name: string;
	deployed_to: string;
	tx_hash: string;
}

export async function registerIssuer(payload: RegisterIssuerPayload): Promise<IssuerResponse> {
	const res = await fetch("/api/issuer/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `Server returned ${res.status}`);
	}

	const data = await res.json();
	return data.issuer;
}
