/**
 * Unit tests for navConfig helpers.
 * Run: pnpm --filter tap-app test:nav
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	APP_NAV_ITEMS,
	CAP_TABLE_SECTIONS,
	capTableHref,
	isCompanyWorkspacePath,
	isWorkspaceRoute,
	issuerIdFromPath,
	mintViewToCapTableView,
	parseCapTableView,
	VALID_CAP_TABLE_VIEWS,
} from "./navConfig.js";

describe("APP_NAV_ITEMS", () => {
	it("includes Companies and New company under /app", () => {
		const ids = APP_NAV_ITEMS.map((i) => i.id);
		assert.deepEqual(ids, ["companies", "mint"]);
		assert.equal(APP_NAV_ITEMS.find((i) => i.id === "companies")?.href, "/app/companies");
		assert.equal(APP_NAV_ITEMS.find((i) => i.id === "mint")?.href, "/app/mint");
	});

	it("match() treats company workspace as Companies active", () => {
		const companies = APP_NAV_ITEMS.find((i) => i.id === "companies")!;
		assert.equal(companies.match("/app/companies"), true);
		assert.equal(companies.match("/app/companies/abc-123"), true);
		assert.equal(companies.match("/app/mint"), false);
	});
});

describe("CAP_TABLE_SECTIONS", () => {
	it("exposes company manage sections with user-facing labels", () => {
		const ids = CAP_TABLE_SECTIONS.map((s) => s.id);
		assert.equal(ids.length, 6);
		assert.ok(ids.includes("transfer-stock"));
		const labels = Object.fromEntries(CAP_TABLE_SECTIONS.map((s) => [s.id, s.label]));
		assert.equal(labels.overview, "Holdings");
		assert.equal(labels["stock-classes"], "Stock classes");
		assert.equal(labels.stakeholders, "Shareholders");
		assert.equal(labels["issue-stock"], "Issue stock");
		assert.equal(labels.transactions, "Transactions");
		// Setup order: class before people
		assert.ok(ids.indexOf("stock-classes") < ids.indexOf("stakeholders"));
	});

	it("VALID_CAP_TABLE_VIEWS matches section ids", () => {
		for (const s of CAP_TABLE_SECTIONS) {
			assert.ok(VALID_CAP_TABLE_VIEWS.has(s.id), s.id);
		}
	});
});

describe("parseCapTableView", () => {
	it("defaults unknown/empty to overview", () => {
		assert.equal(parseCapTableView(undefined), "overview");
		assert.equal(parseCapTableView(null), "overview");
		assert.equal(parseCapTableView(""), "overview");
		assert.equal(parseCapTableView("not-a-view"), "overview");
	});

	it("accepts each valid section id", () => {
		for (const s of CAP_TABLE_SECTIONS) {
			assert.equal(parseCapTableView(s.id), s.id);
		}
	});
});

describe("capTableHref", () => {
	it("builds company URL without view for overview", () => {
		assert.equal(capTableHref("abc-123", "overview"), "/app/companies/abc-123");
	});

	it("includes view query for non-overview sections", () => {
		const href = capTableHref("abc-123", "issue-stock");
		assert.equal(href, "/app/companies/abc-123?view=issue-stock");
	});
});

describe("path helpers", () => {
	it("isWorkspaceRoute is true only under /app", () => {
		assert.equal(isWorkspaceRoute("/"), false);
		assert.equal(isWorkspaceRoute("/app"), true);
		assert.equal(isWorkspaceRoute("/app/mint"), true);
		assert.equal(isWorkspaceRoute("/app/companies"), true);
		assert.equal(isWorkspaceRoute("/mint"), false);
		assert.equal(isWorkspaceRoute("/manage"), false);
	});

	it("isCompanyWorkspacePath and issuerIdFromPath", () => {
		assert.equal(isCompanyWorkspacePath("/app/companies"), false);
		assert.equal(isCompanyWorkspacePath("/app/companies/uuid-here"), true);
		assert.equal(isCompanyWorkspacePath("/app/companies/[issuerId]"), false);
		assert.equal(issuerIdFromPath("/app/companies/uuid-here"), "uuid-here");
		assert.equal(issuerIdFromPath("/app/companies"), null);
		// Next router.pathname pattern must never be treated as a real id
		assert.equal(issuerIdFromPath("/app/companies/[issuerId]"), null);
		assert.equal(issuerIdFromPath("/app/companies/%5BissuerId%5D"), null);
	});
});

describe("mintViewToCapTableView", () => {
	it("maps legacy activity to transactions", () => {
		assert.equal(mintViewToCapTableView("activity"), "transactions");
		assert.equal(mintViewToCapTableView("overview"), "overview");
	});
});
