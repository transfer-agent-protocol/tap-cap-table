import type { Page } from "@playwright/test";

export const ISSUER_ID = "11111111-2222-4333-8444-555555555555";
export const CONTRACT = "0x1111111111111111111111111111111111111111";

export const issuer = {
	_id: ISSUER_ID,
	legal_name: "Palmer Earth Corp",
	deployed_to: CONTRACT,
	tx_hash: "0xabc0000000000000000000000000000000000000000000000000000000000001",
};

const holdings = {
	issuer: {
		_id: ISSUER_ID,
		legal_name: issuer.legal_name,
		deployed_to: CONTRACT,
		initial_shares_authorized: "10000000",
	},
	stakeholders: [
		{
			_id: "aaaa1111-0000-4000-8000-000000000001",
			name: { legal_name: "Alex Palmer" },
			stakeholder_type: "INDIVIDUAL",
			current_relationship: "FOUNDER",
		},
		{
			_id: "aaaa1111-0000-4000-8000-000000000002",
			name: { legal_name: "Jane Investor" },
			stakeholder_type: "INDIVIDUAL",
			current_relationship: "INVESTOR",
		},
	],
	stockClasses: [
		{
			_id: "bbbb2222-0000-4000-8000-000000000001",
			name: "Common",
			class_type: "COMMON",
			initial_shares_authorized: "10000000",
			is_onchain_synced: true,
		},
	],
	holdings: [
		{
			stakeholder: {
				_id: "aaaa1111-0000-4000-8000-000000000001",
				name: { legal_name: "Alex Palmer" },
			},
			stockClass: { _id: "bbbb2222-0000-4000-8000-000000000001", name: "Common" },
			quantity: 800000,
			sharePrice: { amount: "0.0001", currency: "USD" },
		},
		{
			stakeholder: {
				_id: "aaaa1111-0000-4000-8000-000000000002",
				name: { legal_name: "Jane Investor" },
			},
			stockClass: { _id: "bbbb2222-0000-4000-8000-000000000001", name: "Common" },
			quantity: 200000,
			sharePrice: { amount: "1.25", currency: "USD" },
		},
	],
};

// —— Scale fixture: one company with 30 shareholders ——
export const BIG_ISSUER_ID = "22222222-3333-4444-8555-666666666666";

export const bigIssuer = {
	_id: BIG_ISSUER_ID,
	legal_name: "Mango Global Holdings",
	deployed_to: "0x2222222222222222222222222222222222222222",
	tx_hash: "0xabc0000000000000000000000000000000000000000000000000000000000002",
};

const COMMON = { _id: "cccc0000-0000-4000-8000-000000000001", name: "Common" };
const PREFERRED = { _id: "cccc0000-0000-4000-8000-000000000002", name: "Preferred" };

const smallHolders = Array.from({ length: 28 }, (_, i) => ({
	_id: `dddd0000-0000-4000-8000-0000000000${String(i + 10)}`,
	name: { legal_name: `Holder ${String(i + 1).padStart(2, "0")}` },
	stakeholder_type: "INDIVIDUAL",
	current_relationship: "INVESTOR",
}));

const megaFund = {
	_id: "dddd0000-0000-4000-8000-000000000001",
	name: { legal_name: "Mega Fund Capital" },
	stakeholder_type: "INSTITUTION",
	current_relationship: "INVESTOR",
};

const dualHolder = {
	_id: "dddd0000-0000-4000-8000-000000000002",
	name: { legal_name: "Dual Holder" },
	stakeholder_type: "INDIVIDUAL",
	current_relationship: "FOUNDER",
};

const bigHoldings = {
	issuer: {
		_id: BIG_ISSUER_ID,
		legal_name: bigIssuer.legal_name,
		deployed_to: bigIssuer.deployed_to,
		initial_shares_authorized: "100000000",
	},
	stakeholders: [megaFund, dualHolder, ...smallHolders],
	stockClasses: [
		{ ...COMMON, class_type: "COMMON", initial_shares_authorized: "50000000", is_onchain_synced: true },
		{ ...PREFERRED, class_type: "PREFERRED", initial_shares_authorized: "10000000", is_onchain_synced: true },
	],
	holdings: [
		{
			stakeholder: megaFund,
			stockClass: COMMON,
			quantity: 400000,
			sharePrice: { amount: "1.00", currency: "USD" },
		},
		{
			stakeholder: dualHolder,
			stockClass: COMMON,
			quantity: 50000,
			sharePrice: { amount: "0.10", currency: "USD" },
		},
		{
			stakeholder: dualHolder,
			stockClass: PREFERRED,
			quantity: 50000,
			sharePrice: { amount: "2.00", currency: "USD" },
		},
		...smallHolders.map((s) => ({
			stakeholder: s,
			stockClass: COMMON,
			quantity: 10000,
			sharePrice: { amount: "1.00", currency: "USD" },
		})),
	],
};

/** Route all /api/* calls to static fixtures — no server required. */
export async function mockApi(page: Page): Promise<void> {
	await page.route("**/api/**", async (route) => {
		const url = new URL(route.request().url());
		const path = url.pathname;

		if (path.startsWith("/api/issuer/full/")) {
			return route.fulfill({
				json: path.includes(BIG_ISSUER_ID) ? bigIssuer : issuer,
			});
		}
		if (path === "/api/issuer/reconcile") {
			return route.fulfill({ json: { txHashesBackfilled: 0, fixedClasses: [], fixedPeople: [] } });
		}
		if (path === "/api/issuer/summaries") {
			return route.fulfill({
				json: {
					summaries: {
						[ISSUER_ID]: {
							people: 2,
							peopleOnchain: 2,
							classes: 1,
							classesOnchain: 1,
							classesGhost: 0,
							issuances: 2,
							readyToIssue: true,
							hasPositions: true,
						},
					},
				},
			});
		}
		if (path.startsWith("/api/issuer/by-deployer/")) {
			return route.fulfill({ json: { issuers: [issuer] } });
		}
		if (path === "/api/cap-table/holdings/stock") {
			const issuerId = url.searchParams.get("issuerId");
			return route.fulfill({
				json: issuerId === BIG_ISSUER_ID ? bigHoldings : holdings,
			});
		}
		if (path.startsWith("/api/historical-transactions/")) {
			return route.fulfill({ json: { transactions: [] } });
		}
		// Default: empty ok
		return route.fulfill({ json: {} });
	});
}

/** Seed the companies list before the app loads. */
export async function seedMyIssuers(page: Page): Promise<void> {
	await page.addInitScript(
		([key, value]) => {
			window.localStorage.setItem(key, value);
		},
		["tap_my_issuers", JSON.stringify([issuer, bigIssuer])] as const,
	);
}
