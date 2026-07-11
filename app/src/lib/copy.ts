/**
 * Plain-language UI copy for the manage workspace.
 */
export const copy = {
	holdings: {
		title: "Holdings",
		columns: {
			stakeholder: "Holder",
			stockClass: "Class",
			quantity: "Shares",
			sharePrice: "Price",
			status: "Status",
		},
		empty: "No share positions on the blockchain yet.",
		loadError: "Couldn't load holdings.",
		caption: "",
	},
	issueStock: {
		needsSetup: "Add a person and an onchain share class first.",
	},
	status: {
		onchain: "Confirmed",
		pending: "Pending",
		reverted: "Failed",
	},
	tx: {
		walletRequired: "Connect your wallet first.",
		revertedTitle: "Transaction failed",
		revertedGeneric: "Nothing changed onchain.",
		issuanceReverted: "Issuance failed — usually not enough authorized shares left.",
		submittedTitle: {
			stockClass: "Share class submitted",
			stakeholder: "Person submitted",
			issuance: "Issuance submitted",
		},
		submittedBody: "Waiting for confirmation…",
		confirmedTitle: {
			stockClass: "Share class created",
			stakeholder: "Person added",
			issuance: "Stock issued",
		},
	},
} as const;
