export interface StakeholderName {
	legal_name: string;
	first_name?: string;
	last_name?: string;
}

export interface StakeholderData {
	name: StakeholderName;
	stakeholder_type: "INDIVIDUAL" | "INSTITUTION";
	current_relationship: string;
	issuer_assigned_id?: string;
	comments?: string[];
	// Optional contact fields can be added later for richer forms
}

export interface CreateStakeholderPayload {
	issuerId: string;
	data: StakeholderData;
}

export interface StakeholderResponse {
	stakeholder: {
		_id: string;
		name: StakeholderName;
		stakeholder_type: string;
		current_relationship: string;
		is_onchain_synced: boolean;
		[key: string]: unknown;
	};
}

export async function createStakeholder(payload: CreateStakeholderPayload): Promise<StakeholderResponse> {
	const res = await fetch("/api/stakeholder/create", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `Server returned ${res.status}`);
	}

	return res.json();
}

/**
 * Register a stakeholder that the caller already created onchain via their own wallet.
 * `id` is the UUID form of the bytes16 used in the onchain createStakeholder tx.
 */
export async function registerStakeholderOnchain(
	payload: CreateStakeholderPayload & { id: string },
): Promise<StakeholderResponse> {
	const res = await fetch("/api/stakeholder/register-onchain", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `Server returned ${res.status}`);
	}

	return res.json();
}
