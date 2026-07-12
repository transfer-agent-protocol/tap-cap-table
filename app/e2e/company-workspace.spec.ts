import { expect, test } from "@playwright/test";
import { ISSUER_ID, mockApi, seedMyIssuers } from "./mocks";

test.beforeEach(async ({ page }) => {
	await mockApi(page);
	await seedMyIssuers(page);
});

const DRAWER_BREAKPOINT = 768;

async function openSection(page: import("@playwright/test").Page, sectionId: string) {
	const phone = (page.viewportSize()?.width ?? 1280) <= DRAWER_BREAKPOINT;
	if (phone) {
		await page.getByTestId("mobile-nav-toggle").click();
	}
	await page.locator(`[data-cap-section='${sectionId}']`).click();
}

test.describe("company workspace", () => {
	test("holdings view shows positions, ownership bar, and counts", async ({ page }) => {
		await page.goto(`/app/companies/${ISSUER_ID}`);

		await expect(page.getByTestId("cap-table-dashboard")).toBeVisible();
		await expect(page.getByTestId("view-overview")).toBeVisible();
		await expect(page.getByTestId("ownership-bar")).toBeVisible();

		// Authorized vs issued surfaced honestly (10M authorized, 1M issued)
		const stats = page.getByTestId("share-stats");
		await expect(stats).toBeVisible();
		await expect(stats).toContainText("Authorized");
		await expect(stats).toContainText("10,000,000");
		await expect(stats).toContainText("Issued");
		await expect(stats).toContainText("1,000,000");
		await expect(stats).toContainText("Remaining");
		await expect(stats).toContainText("9,000,000");
		await expect(stats).toContainText("10%");

		// Mocked holdings render as table rows (mono/tabular data)
		await expect(page.getByRole("cell", { name: "Alex Palmer" })).toBeVisible();
		await expect(page.getByRole("cell", { name: "800,000" })).toBeVisible();
	});

	test("side nav drives section changes via ?view=", async ({ page }) => {
		await page.goto(`/app/companies/${ISSUER_ID}`);
		await expect(page.getByTestId("view-overview")).toBeVisible();

		await openSection(page, "stock-classes");
		await expect(page).toHaveURL(/view=stock-classes/);
		await expect(page.getByTestId("view-stock-classes")).toBeVisible();
		// Name and Type columns both read "Common" for the common class
		await expect(
			page.getByTestId("view-stock-classes").getByRole("cell", { name: "Common", exact: true }).first(),
		).toBeVisible();
		// Per-class Authorized and Issued
		await expect(
			page.getByTestId("view-stock-classes").getByRole("cell", { name: "10,000,000" }),
		).toBeVisible();
		await expect(
			page.getByTestId("view-stock-classes").getByRole("cell", { name: "1,000,000", exact: true }),
		).toBeVisible();

		await openSection(page, "stakeholders");
		await expect(page).toHaveURL(/view=stakeholders/);
		await expect(page.getByTestId("view-stakeholders")).toBeVisible();
		await expect(page.getByRole("cell", { name: "Jane Investor" })).toBeVisible();

		await openSection(page, "transactions");
		await expect(page).toHaveURL(/view=transactions/);
		await expect(page.getByTestId("view-transactions")).toBeVisible();
	});

	test("add shareholder form opens on demand and cancels", async ({ page }) => {
		await page.goto(`/app/companies/${ISSUER_ID}?view=stakeholders`);
		await expect(page.getByTestId("view-stakeholders")).toBeVisible();

		await page.getByRole("button", { name: "Add shareholder" }).click();
		await expect(page.getByText("Legal name")).toBeVisible();

		await page.getByRole("button", { name: "Cancel" }).click();
		await expect(page.getByText("Legal name")).toHaveCount(0);
	});

	test("issue stock without a wallet hits the wallet gate", async ({ page }) => {
		await page.goto(`/app/companies/${ISSUER_ID}?view=issue-stock`);
		await expect(page.getByTestId("view-issue-stock")).toBeVisible();

		// Fill the minimum and submit — no wallet connected, expect the gate modal.
		// Scope to the view: the side nav has an "Issue stock" destination too.
		const view = page.getByTestId("view-issue-stock");
		await view.locator("select").first().selectOption({ index: 1 });
		await view.locator("select").nth(1).selectOption({ index: 1 });
		await view.getByRole("button", { name: "Issue stock" }).click();

		await expect(page.getByRole("dialog")).toBeVisible();
		await expect(page.getByRole("dialog")).toContainText(/wallet/i);
	});

	test("unknown company shows an explicit error state with recovery", async ({ page }) => {
		await page.route("**/api/issuer/full/**", (route) =>
			route.fulfill({ status: 404, json: { error: "not found" } }),
		);
		await page.route("**/api/cap-table/holdings/stock*", (route) =>
			route.fulfill({ status: 404, json: { error: "not found" } }),
		);
		// No local issuer for this id
		await page.goto("/app/companies/00000000-0000-4000-8000-000000000000");

		await expect(page.getByText("Company not found", { exact: false })).toBeVisible();
		await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
	});
});
