export interface StockClassData {
	name: string;
	class_type: "COMMON" | "PREFERRED";
	default_id_prefix: string;
	initial_shares_authorized: string;
	votes_per_share: string;
	price_per_share: { currency: string; amount: string };
	seniority: string;
	comments?: string[];
}

export interface CreateStockClassPayload {
	issuerId: string;
	data: StockClassData;
}

export interface StockClassResponse {
	stockClass: {
		_id: string;
		name: string;
		class_type: string;
		initial_shares_authorized: string;
		price_per_share: { currency: string; amount: string };
		is_onchain_synced: boolean;
		[key: string]: unknown;
	};
}

export async function createStockClass(payload: CreateStockClassPayload): Promise<StockClassResponse> {
	const res = await fetch("/api/stock-class/create", {
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
 * Register a stock class that the caller already created onchain via their own wallet.
 * `id` is the UUID form of the bytes16 used in the onchain createStockClass tx.
 */
export async function registerStockClassOnchain(
	payload: CreateStockClassPayload & { id: string },
): Promise<StockClassResponse> {
	const res = await fetch("/api/stock-class/register-onchain", {
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
