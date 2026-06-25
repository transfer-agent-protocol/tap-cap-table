/**
 * Centralized UI copy for the cap-table manager — table headers, labels, and the
 * loading/error/empty strings. Mirrors `visualize-laws-app/lib/copy.ts`: keeping copy in
 * one place keeps the components declarative and makes wording changes a one-line edit.
 */
export const copy = {
	holdings: {
		title: "Cap Table Holdings",
		columns: {
			stakeholder: "Stakeholder",
			stockClass: "Stock Class",
			quantity: "Quantity",
			sharePrice: "Share Price",
			status: "Status",
		},
		empty: "No positions yet. Create a stock class and a stakeholder, then issue stock.",
		loadError: "Couldn't load cap table holdings.",
		caption:
			"Live onchain positions (via getAveragePosition) joined with the latest issuance records. Recent direct-wallet activity shows as Pending until the poller syncs it.",
	},
	issueStock: {
		needsSetup: "Add a stakeholder and a stock class first — they'll appear here automatically.",
	},
	status: {
		onchain: "Onchain",
		pending: "Pending sync",
	},
} as const;
