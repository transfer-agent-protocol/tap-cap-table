// Sample issuer data for pre-filling the mint form during development
export const SAMPLE_ISSUER = {
	legalName: "Transfer Agent Protocol",
	formationDate: "2022-08-23",
	countryOfFormation: "US",
	sharesAuthorized: "10000000",
	subdivision: "DE",
	taxId: "88-3977591",
	taxCountry: "US",
	emailAddress: "alex@plume.org",
	emailType: "BUSINESS",
	addressType: "LEGAL",
	streetSuite: "Empire State Building, 20 W 34th St. Suite 7700",
	city: "New York",
	addressSubdivision: "NY",
	addressCountry: "US",
	postalCode: "10118",
};

// Samples for the post-mint stock class / stakeholder / issuance flows (used by the new dashboard forms)
export const SAMPLE_STOCK_CLASS = {
	name: "Series A Common",
	class_type: "COMMON" as const,
	default_id_prefix: "CS-A",
	initial_shares_authorized: "1000000",
	votes_per_share: "1",
	price_per_share: { currency: "USD", amount: "4.20" },
	seniority: "1",
	comments: [],
};

export const SAMPLE_STAKEHOLDER = {
	name: { legal_name: "Alex Palmer", first_name: "Alex", last_name: "Palmer" },
	stakeholder_type: "INDIVIDUAL" as const,
	current_relationship: "FOUNDER",
	issuer_assigned_id: "",
	comments: [],
};

export const SAMPLE_ISSUANCE = {
	quantity: "100000",
	share_price: { amount: "4.20", currency: "USD" },
	stock_legend_ids: [],
	custom_id: "CS-A-001",
	security_law_exemptions: [],
	comments: ["Founder stock issuance"],
};
