/**
 * Unit tests for shipped navConfig helpers (cap-table section routing).
 * Run: pnpm --filter tap-app test:nav
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	APP_NAV_ITEMS,
	CAP_TABLE_SECTIONS,
	capTableHref,
	mintViewToCapTableView,
	parseCapTableView,
	VALID_CAP_TABLE_VIEWS,
} from "./navConfig.js";

describe("APP_NAV_ITEMS", () => {
	it("includes Home, Mint, and Manage destinations", () => {
		const ids = APP_NAV_ITEMS.map((i) => i.id);
		assert.deepEqual(ids, ["home", "mint", "manage"]);
		assert.equal(APP_NAV_ITEMS.find((i) => i.id === "mint")?.href, "/mint");
		assert.equal(APP_NAV_ITEMS.find((i) => i.id === "manage")?.href, "/manage");
	});

	it("match() distinguishes app routes", () => {
		const manage = APP_NAV_ITEMS.find((i) => i.id === "manage")!;
		assert.equal(manage.match("/manage"), true);
		assert.equal(manage.match("/manage/cap-table"), false);
		assert.equal(manage.match("/mint"), false);
	});
});

describe("CAP_TABLE_SECTIONS", () => {
	it("exposes OCF-aligned manage sections", () => {
		const ids = CAP_TABLE_SECTIONS.map((s) => s.id);
		assert.ok(ids.includes("overview"));
		assert.ok(ids.includes("stakeholders"));
		assert.ok(ids.includes("stock-classes"));
		assert.ok(ids.includes("issue-stock"));
		assert.ok(ids.includes("transactions"));
		assert.equal(ids.length, 5);
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

	it("uses first element of array query values", () => {
		assert.equal(parseCapTableView(["stakeholders", "overview"]), "stakeholders");
	});
});

describe("capTableHref", () => {
	it("builds issuer URL without view for overview", () => {
		const href = capTableHref("abc-123", "overview");
		assert.equal(href, "/manage/cap-table?issuerId=abc-123");
	});

	it("includes view query for non-overview sections", () => {
		const href = capTableHref("abc-123", "issue-stock");
		assert.ok(href.includes("issuerId=abc-123"));
		assert.ok(href.includes("view=issue-stock"));
		assert.ok(href.startsWith("/manage/cap-table?"));
	});
});

describe("mintViewToCapTableView", () => {
	it("maps legacy activity to transactions", () => {
		assert.equal(mintViewToCapTableView("activity"), "transactions");
		assert.equal(mintViewToCapTableView("overview"), "overview");
		assert.equal(mintViewToCapTableView("stakeholders"), "stakeholders");
	});
});
