import { expect, test } from "@playwright/test";
import { BIG_ISSUER_ID, mockApi, seedMyIssuers } from "./mocks";

/**
 * Cap tables at scale — 30 shareholders, 31 positions, one dual-class holder.
 * The UI must stay scannable: capped legend, search, pagination, grouping.
 */
test.beforeEach(async ({ page }) => {
	await mockApi(page);
	await seedMyIssuers(page);
	await page.goto(`/app/companies/${BIG_ISSUER_ID}`);
	await expect(page.getByTestId("view-overview")).toBeVisible();
});

test.describe("cap table at scale", () => {
	test("ownership legend is capped with a summary chip", async ({ page }) => {
		const bar = page.getByTestId("ownership-bar");
		await expect(bar).toBeVisible();

		// 30 tiny holders must not produce 30 chips
		const more = page.getByTestId("legend-more");
		await expect(more).toBeVisible();
		await expect(more).toContainText(/\+ \d+ more/);
		await expect(more).toContainText("of issued");
	});

	test("holdings paginate and expand with Show more", async ({ page }) => {
		// 31 positions, page size 25
		await expect(page.getByTestId("table-row-count")).toContainText("Showing 25 of 31");
		await expect(page.getByRole("cell", { name: "Mega Fund Capital" })).toBeVisible();

		await page.getByTestId("table-show-more").click();
		await expect(page.getByTestId("table-row-count")).toHaveCount(0);
	});

	test("search narrows holdings", async ({ page }) => {
		await page.getByTestId("holdings-search").fill("Mega");
		await expect(page.getByRole("cell", { name: "Mega Fund Capital" })).toBeVisible();
		await expect(page.getByRole("cell", { name: "Holder 01" })).toHaveCount(0);

		await page.getByTestId("holdings-search").fill("no such holder");
		await expect(page.getByText("No holdings match")).toBeVisible();
	});

	test("by-shareholder mode aggregates dual-class holders", async ({ page }) => {
		await page.getByTestId("holdings-mode-grouped").click();

		// Dual Holder's Common + Preferred collapse into one row totalling 100,000
		const row = page.getByRole("row", { name: /Dual Holder/ });
		await expect(row).toBeVisible();
		await expect(row).toContainText("100,000");
		await expect(row).toContainText("Common");
		await expect(row).toContainText("Preferred");

		// 30 shareholders → 30 grouped rows: first page + remainder
		await expect(page.getByTestId("table-row-count")).toContainText("Showing 25 of 30");
	});

	test("shareholders view searches and shows totals", async ({ page, viewport }) => {
		const phone = (viewport?.width ?? 1280) <= 768;
		if (phone) {
			await page.getByTestId("mobile-nav-toggle").click();
		}
		await page.locator("[data-cap-section='stakeholders']").click();
		await expect(page.getByTestId("view-stakeholders")).toBeVisible();

		// Default sort: biggest holder first with totals populated
		await expect(page.getByTestId("table-row-count")).toContainText("Showing 25 of 30");
		const megaRow = page.getByRole("row", { name: /Mega Fund Capital/ });
		await expect(megaRow).toContainText("400,000");

		await page.getByTestId("shareholders-search").fill("Dual");
		await expect(page.getByRole("cell", { name: "Dual Holder" })).toBeVisible();
		await expect(page.getByRole("cell", { name: "Mega Fund Capital" })).toHaveCount(0);
	});
});
