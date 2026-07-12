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

/** Route all /api/* calls to static fixtures — no server required. */
export async function mockApi(page: Page): Promise<void> {
	await page.route("**/api/**", async (route) => {
		const url = new URL(route.request().url());
		const path = url.pathname;

		if (path.startsWith("/api/issuer/full/")) {
			return route.fulfill({ json: issuer });
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
			return route.fulfill({ json: holdings });
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
		["tap_my_issuers", JSON.stringify([issuer])] as const,
	);
}
