/**
 * Centralized UI copy — plain language for operators, not protocol engineers.
 */
export const copy = {
	holdings: {
		title: "Holdings",
		columns: {
			stakeholder: "Person / entity",
			stockClass: "Share class",
			quantity: "Shares",
			sharePrice: "Price",
			status: "Status",
		},
		empty: "No shares issued yet. Add a person, a share class, then issue stock.",
		loadError: "Couldn't load holdings. Is the API running?",
		caption:
			"Live balances from the chain. New activity may show as Pending for a moment while we sync.",
	},
	issueStock: {
		needsSetup: "Add at least one person and one share class first.",
	},
	status: {
		onchain: "Confirmed",
		pending: "Pending",
		reverted: "Failed",
	},
	tx: {
		walletRequired: "Connect your admin wallet to do this.",
		revertedTitle: "Transaction failed",
		revertedGeneric: "The transaction failed onchain — nothing changed.",
		issuanceReverted:
			"Issuance failed. Usually that means there aren't enough authorized shares left.",
		submittedTitle: {
			stockClass: "Share class submitted",
			stakeholder: "Person submitted",
			issuance: "Issuance submitted",
		},
		submittedBody: "Waiting for confirmation...",
		confirmedTitle: {
			stockClass: "Share class created",
			stakeholder: "Person added",
			issuance: "Stock issued",
		},
	},
} as const;
