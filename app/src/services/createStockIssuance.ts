export interface SharePrice {
	amount: string;
	currency: string;
}

export interface StockIssuanceData {
	stakeholder_id: string;
	stock_class_id: string;
	quantity: string;
	share_price: SharePrice;
	stock_legend_ids?: string[];
	custom_id?: string;
	security_law_exemptions?: unknown[];
	comments?: string[];
}

export interface CreateStockIssuancePayload {
	issuerId: string;
	data: StockIssuanceData;
}

export interface StockIssuanceResponse {
	stockIssuance: {
		id: string;
		security_id: string;
		stakeholder_id: string;
		stock_class_id: string;
		quantity: string;
		share_price: SharePrice;
		custom_id?: string;
		[key: string]: unknown;
	};
}

export async function createStockIssuance(payload: CreateStockIssuancePayload): Promise<StockIssuanceResponse> {
	const res = await fetch("/api/transactions/issuance/stock", {
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
 * Register a stock issuance that the caller already submitted onchain via their own wallet.
 * No id is required — the contract assigns issuance + security ids internally, and the poller
 * writes the authoritative StockIssuance doc when it sees the event. This endpoint just
 * validates the metadata so the UI can render optimistically until the poller catches up.
 */
export async function registerStockIssuanceOnchain(payload: CreateStockIssuancePayload): Promise<StockIssuanceResponse> {
	const res = await fetch("/api/transactions/issuance/stock/register-onchain", {
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
