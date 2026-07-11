/**
 * Plain-language UI copy for the manage workspace.
 * Prefer company-admin language over protocol / poller jargon.
 */
export const copy = {
	nav: {
		mint: "New company",
		manage: "Companies",
	},
	holdings: {
		title: "Holdings",
		columns: {
			stakeholder: "Shareholder",
			stockClass: "Stock class",
			quantity: "Shares",
			sharePrice: "Price",
			status: "Status",
		},
		empty: "No shares issued yet.",
		loadError: "Couldn't load holdings. Try Refresh.",
	},
	shareholders: {
		title: "Shareholders",
		add: "Add shareholder",
		empty: "No shareholders yet. Create a stock class first, then add people to issue stock to.",
		create: "Add shareholder",
		creating: "Confirm in wallet…",
		cancel: "Cancel",
	},
	stockClasses: {
		title: "Stock classes",
		add: "Add stock class",
		empty: "No stock classes yet. Create one first — then add shareholders and issue stock.",
		create: "Create stock class",
		creating: "Confirm in wallet…",
		cancel: "Cancel",
		live: "Ready",
		notLive: "Not on blockchain",
	},
	issueStock: {
		title: "Issue stock",
		needsSetup: "Create a stock class and add a shareholder first.",
		needsClass: "Create a stock class and confirm it in your wallet first.",
		needsPeople: "Add a shareholder first.",
	},
	transactions: {
		title: "Transactions",
		empty: "No transactions yet. Issuances and other actions will show up here.",
		columns: {
			type: "Type",
			details: "Details",
			shares: "Shares",
			price: "Price",
			date: "Date",
			status: "Status",
			tx: "Transaction",
		},
	},
	status: {
		onchain: "Confirmed",
		pending: "Pending",
		reverted: "Failed",
	},
	sync: {
		idle: "Refresh",
		working: "Refreshing…",
		upToDate: "Everything looks up to date.",
		linkedTx: (n: number) =>
			n === 1 ? "Linked 1 transaction to the explorer." : `Linked ${n} transactions to the explorer.`,
		fixedRecords: "Updated company records from the blockchain.",
		ghostClasses: "A stock class still needs to be created on the blockchain before you can issue stock.",
		failed: "Couldn't refresh. Try again in a moment.",
	},
	setup: {
		title: "Get this company ready",
		/** Order: class → people → issue (you need a class before issuing to anyone). */
		stepClass: "Create a stock class",
		stepShareholder: "Add a shareholder",
		stepIssue: "Issue stock",
	},
	tx: {
		walletRequired: "Connect your wallet in the top bar first.",
		contractMissing:
			"This company has no contract address yet. Open it from Companies after mint, or Load from wallet so the address is saved.",
		revertedTitle: "Transaction failed",
		revertedGeneric: "Nothing changed. You can try again.",
		issuanceReverted: "Issuance failed — usually not enough authorized shares left.",
		submittedTitle: {
			stockClass: "Stock class submitted",
			stakeholder: "Shareholder submitted",
			issuance: "Issuance submitted",
		},
		submittedBody: "Waiting for wallet confirmation…",
		confirmedTitle: {
			stockClass: "Stock class created",
			stakeholder: "Shareholder created",
			issuance: "Stock issued",
		},
	},
	errors: {
		holdingsHttp: (status: string) => {
			if (status.includes("404") || /not found/i.test(status)) {
				return "Company not found on the server. Open it from Companies or create a new one.";
			}
			if (/no deployed|deployed_to|contract address/i.test(status)) {
				return "This company has no contract address on the server. Try Companies → Load from wallet, then open it again.";
			}
			if (status.startsWith("HTTP")) {
				return `Couldn't load company data. ${status}`;
			}
			return `Couldn't load company data (${status}).`;
		},
	},
	/** Human labels for server transactionType / object_type */
	txTypeLabel: (raw: string | undefined): string => {
		if (!raw) return "Transaction";
		const map: Record<string, string> = {
			StockIssuance: "Stock issued",
			TX_STOCK_ISSUANCE: "Stock issued",
			StockTransfer: "Stock transfer",
			StockCancellation: "Stock cancelled",
			StockRetraction: "Stock retracted",
			StockReissuance: "Stock reissued",
			StockRepurchase: "Stock repurchase",
			StockAcceptance: "Stock accepted",
			IssuerAuthorizedSharesAdjustment: "Authorized shares updated",
			StockClassAuthorizedSharesAdjustment: "Class authorized shares updated",
			stock_class: "Stock class created",
			stakeholder: "Shareholder created",
			stock_issuance: "Stock issued",
			// Legacy activity labels already written to localStorage
			"Stock class": "Stock class created",
			Shareholder: "Shareholder created",
			"Stock issuance": "Stock issued",
		};
		return map[raw] || raw.replace(/_/g, " ").replace(/^TX\s+/i, "");
	},
} as const;

/** Shorten 0x hashes for tables */
export function shortTx(hash: string, head = 6, tail = 4): string {
	if (!hash || hash.length < head + tail + 3) return hash;
	return `${hash.slice(0, head + 2)}…${hash.slice(-tail)}`;
}
