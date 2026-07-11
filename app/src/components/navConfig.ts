/**
 * Application navigation configuration.
 *
 * Workspace nav (mint / manage) lives in the left drawer on app routes.
 * Cap-table section names align with OCF objects the protocol supports onchain.
 * Landing (`/`) is marketing — logo returns home; it is not a drawer item.
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
	/** Match pathname for active state */
	match: (pathname: string, view?: string | null) => boolean;
}

/** Product workspace destinations in the left drawer (not marketing Home). */
export const APP_NAV_ITEMS: NavItem[] = [
	{
		id: "mint",
		label: "Mint",
		href: "/mint",
		match: (pathname) => pathname === "/mint",
	},
	{
		id: "manage",
		label: "Manage",
		href: "/manage",
		// Parent stays active while working inside a single issuer
		match: (pathname) => pathname === "/manage" || pathname.startsWith("/manage/"),
	},
];

/** Cap-table management sections (OCF-aligned) when an issuer is selected. */
export const CAP_TABLE_SECTIONS: Array<{
	id: CapTableView;
	label: string;
	description: string;
}> = [
	{
		id: "overview",
		label: "Overview",
		description: "Summary and holdings",
	},
	{
		id: "stakeholders",
		label: "People",
		description: "Founders, employees, investors",
	},
	{
		id: "stock-classes",
		label: "Share classes",
		description: "Common, preferred, etc.",
	},
	{
		id: "issue-stock",
		label: "Issue stock",
		description: "Grant shares",
	},
	{
		id: "transactions",
		label: "Activity",
		description: "Recent events",
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

/** True for product workspace routes that use the left drawer. */
export function isWorkspaceRoute(pathname: string): boolean {
	return pathname === "/mint" || pathname === "/manage" || pathname.startsWith("/manage/");
}
