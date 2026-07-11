/**
 * Application navigation configuration.
 *
 * Primary page nav lives in the left drawer. Cap-table section names align
 * with OCF object types the protocol supports onchain (Issuer, Stakeholder,
 * StockClass, StockIssuance / TX_STOCK_ISSUANCE, historical transactions).
 */

export type CapTableView =
	| "overview"
	| "stakeholders"
	| "stock-classes"
	| "issue-stock"
	| "transactions";

export interface NavItem {
	id: string;
	label: string;
	href: string;
	/** Match pathname (and optional view query) for active state */
	match: (pathname: string, view?: string | null) => boolean;
}

/** Global app destinations always shown in the left drawer. */
export const APP_NAV_ITEMS: NavItem[] = [
	{
		id: "home",
		label: "Home",
		href: "/",
		match: (pathname) => pathname === "/",
	},
	{
		id: "mint",
		label: "Mint Cap Table",
		href: "/mint",
		match: (pathname) => pathname === "/mint",
	},
	{
		id: "manage",
		label: "Manage Cap Tables",
		href: "/manage",
		match: (pathname) => pathname === "/manage",
	},
];

/** Cap-table management sections (OCF-aligned) shown when an issuer is selected. */
export const CAP_TABLE_SECTIONS: Array<{
	id: CapTableView;
	label: string;
	description: string;
}> = [
	{
		id: "overview",
		label: "Overview & Holdings",
		description: "Issuer summary and active positions",
	},
	{
		id: "stakeholders",
		label: "Stakeholders",
		description: "OCF Stakeholder objects",
	},
	{
		id: "stock-classes",
		label: "Stock Classes",
		description: "OCF StockClass objects",
	},
	{
		id: "issue-stock",
		label: "Issue Stock",
		description: "TX_STOCK_ISSUANCE",
	},
	{
		id: "transactions",
		label: "Transactions",
		description: "Historical transactions",
	},
];

export const VALID_CAP_TABLE_VIEWS = new Set<string>(
	CAP_TABLE_SECTIONS.map((s) => s.id),
);

/** Normalize a URL/view query param into a CapTableView. */
export function parseCapTableView(raw: string | string[] | undefined | null): CapTableView {
	const value = Array.isArray(raw) ? raw[0] : raw;
	if (value && VALID_CAP_TABLE_VIEWS.has(value)) {
		return value as CapTableView;
	}
	return "overview";
}

/** Build a manage cap-table URL with issuer + view. */
export function capTableHref(issuerId: string, view: CapTableView = "overview"): string {
	const params = new URLSearchParams();
	params.set("issuerId", issuerId);
	if (view !== "overview") {
		params.set("view", view);
	}
	return `/manage/cap-table?${params.toString()}`;
}

/** Legacy MintView → CapTableView (for migration from right-side drawer). */
export function mintViewToCapTableView(
	view: "overview" | "stock-classes" | "stakeholders" | "activity",
): CapTableView {
	if (view === "activity") return "transactions";
	return view;
}
