/**
 * Centralized UI copy for the cap-table manager.
 * Voice: direct, OCF-aware, honest about onchain vs offchain.
 */
export const copy = {
	holdings: {
		title: "Positions",
		columns: {
			stakeholder: "Stakeholder",
			stockClass: "Stock class",
			quantity: "Quantity",
			sharePrice: "Share price",
			status: "Status",
		},
		empty: "No positions yet. Create a stock class and a stakeholder, then issue stock.",
		loadError: "Couldn't load positions. Is the API and poller running?",
		caption:
			"Onchain balances (getAveragePosition) joined with latest issuance metadata. New wallet writes show Pending until the event poller mirrors them offchain.",
	},
	issueStock: {
		needsSetup: "Create at least one stakeholder and one stock class first.",
	},
	status: {
		onchain: "Onchain",
		pending: "Pending sync",
		reverted: "Reverted",
	},
	tx: {
		walletRequired: "Connect the admin wallet to submit this onchain action.",
		revertedTitle: "Transaction reverted",
		revertedGeneric: "Mined but reverted — nothing was applied onchain.",
		issuanceReverted:
			"Issuance reverted. Common cause: quantity exceeds issuer or stock-class authorized shares remaining.",
		submittedTitle: {
			stockClass: "Stock class submitted",
			stakeholder: "Stakeholder submitted",
			issuance: "Issuance submitted",
		},
		submittedBody: "Waiting for the receipt. Success only after onchain confirmation.",
		confirmedTitle: {
			stockClass: "Stock class confirmed onchain",
			stakeholder: "Stakeholder confirmed onchain",
			issuance: "Issuance confirmed onchain",
		},
	},
	scope: {
		/** What we ship in v1 UI — OCF core only, not full Carta surface */
		core: [
			"ISSUER",
			"STAKEHOLDER",
			"STOCK_CLASS",
			"TX_STOCK_ISSUANCE",
			"Holdings + historical transactions",
		] as const,
		later: [
			"Transfers / cancellations / reissuances",
			"Stock plans & equity compensation",
			"Convertibles & warrants",
			"Vesting engines",
			"Valuations & financings",
		] as const,
	},
} as const;
