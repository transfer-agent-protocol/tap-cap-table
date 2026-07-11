/**
 * Centralized UI copy for the cap-table manager — table headers, labels, and the
 * loading/error/empty strings. Keeping copy in one place keeps components declarative.
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
		reverted: "Reverted",
	},
	tx: {
		walletRequired: "Please connect your wallet (as Admin) to submit this onchain action.",
		revertedTitle: "Transaction reverted on-chain",
		revertedGeneric: "The transaction was mined but reverted, so nothing was applied.",
		issuanceReverted:
			"The transaction was mined but reverted, so no shares were issued. Common causes: quantity exceeds issuer or stock-class authorized remaining shares.",
		submittedTitle: {
			stockClass: "Stock class submitted",
			stakeholder: "Stakeholder submitted",
			issuance: "Issuance submitted",
		},
		submittedBody: "Waiting for the transaction receipt. Success is only shown after on-chain confirmation.",
		confirmedTitle: {
			stockClass: "Stock class confirmed on-chain",
			stakeholder: "Stakeholder confirmed on-chain",
			issuance: "Issuance confirmed on-chain",
		},
	},
} as const;
