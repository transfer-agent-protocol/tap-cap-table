/**
 * Application navigation configuration.
 *
 * Marketing: `/` (no product shell, no wallet).
 * Product: `/app/*` — left drawer + wallet.
 */

export type CapTableView =
	| "overview"
	| "stakeholders"
	| "stock-classes"
	| "issue-stock"
	| "transfer-stock"
	| "transactions";

export interface NavItem {
	id: string;
	label: string;
	href: string;
	/** Match pathname for active state */
	match: (pathname: string, view?: string | null) => boolean;
}

/** Product workspace destinations in the left drawer. */
export const APP_NAV_ITEMS: NavItem[] = [
	{
		id: "companies",
		label: "Companies",
		href: "/app/companies",
		match: (pathname) =>
			pathname === "/app" ||
			pathname === "/app/companies" ||
			pathname.startsWith("/app/companies/"),
	},
	{
		id: "mint",
		label: "New company",
		href: "/app/mint",
		match: (pathname) => pathname === "/app/mint",
	},
];

/** Cap-table management sections when an issuer is selected. */
/** Nav order follows setup: class → people → issue. */
export const CAP_TABLE_SECTIONS: Array<{
	id: CapTableView;
	label: string;
	description: string;
}> = [
	{ id: "overview", label: "Holdings", description: "Who owns what" },
	{ id: "stock-classes", label: "Stock classes", description: "Common, preferred, etc." },
	{ id: "stakeholders", label: "Shareholders", description: "People and entities on the cap table" },
	{ id: "issue-stock", label: "Issue stock", description: "Grant shares to a shareholder" },
	{ id: "transfer-stock", label: "Transfer", description: "Move shares between shareholders" },
	{ id: "transactions", label: "Transactions", description: "Issuances and other history" },
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

/** Company workspace URL under /app/companies/[issuerId]. */
export function capTableHref(issuerId: string, view: CapTableView = "overview"): string {
	const base = `/app/companies/${encodeURIComponent(issuerId)}`;
	if (view === "overview") return base;
	const params = new URLSearchParams();
	params.set("view", view);
	return `${base}?${params.toString()}`;
}

/** Legacy MintView → CapTableView. */
export function mintViewToCapTableView(
	view: "overview" | "stock-classes" | "stakeholders" | "activity",
): CapTableView {
	if (view === "activity") return "transactions";
	return view;
}

/** True when the left workspace drawer + product chrome apply. */
export function isWorkspaceRoute(pathname: string): boolean {
	return pathname === "/app" || pathname.startsWith("/app/");
}

/** True when viewing a single company cap table (use asPath, not route pattern). */
export function isCompanyWorkspacePath(pathname: string): boolean {
	const path = (pathname || "").split("?")[0];
	// Real UUID path — not the Next pattern `/app/companies/[issuerId]`
	if (path === "/app/companies/[issuerId]") return false;
	return /^\/app\/companies\/[^/]+$/.test(path) && !path.endsWith("/companies");
}

/**
 * Issuer id from a *resolved* path or asPath (not router.pathname).
 * router.pathname is the route pattern `/app/companies/[issuerId]` — never pass that here.
 */
export function issuerIdFromPath(pathname: string): string | null {
	const path = (pathname || "").split("?")[0];
	const m = path.match(/^\/app\/companies\/([^/]+)/);
	if (!m) return null;
	let id: string;
	try {
		id = decodeURIComponent(m[1]);
	} catch {
		id = m[1];
	}
	// Guard against accidentally using the Next route pattern segment
	if (!id || id === "[issuerId]" || id === "undefined") return null;
	return id;
}
