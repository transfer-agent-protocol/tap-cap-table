import { expect, test } from "@playwright/test";
import { ISSUER_ID, issuer, mockApi, seedMyIssuers } from "./mocks";

test.beforeEach(async ({ page }) => {
	await mockApi(page);
});

test.describe("companies list", () => {
	test("shows an explicit empty state with a path forward", async ({ page }) => {
		await page.goto("/app/companies");

		await expect(page.getByTestId("manage-hub")).toBeVisible();
		await expect(page.getByText("Nothing here yet.")).toBeVisible();
		await expect(page.getByRole("link", { name: "Create a company" })).toBeVisible();
	});

	test("lists seeded companies with readiness chips and opens one", async ({ page }) => {
		await seedMyIssuers(page);
		await page.goto("/app/companies");

		await expect(page.getByText(issuer.legal_name)).toBeVisible();
		// Summary chips from the mocked summaries endpoint
		await expect(page.getByText("Has holdings")).toBeVisible();
		await expect(page.getByText("2 shareholders")).toBeVisible();

		await page.getByRole("button", { name: "Open", exact: true }).click();
		await expect(page).toHaveURL(new RegExp(`/app/companies/${ISSUER_ID}`));
		await expect(page.getByTestId("cap-table-dashboard")).toBeVisible();
	});

	test("header actions include New company and Load from wallet", async ({ page }) => {
		await page.goto("/app/companies");

		const header = page.getByTestId("page-header");
		await expect(header.getByRole("button", { name: "New company" })).toBeVisible();
		await expect(header.getByRole("button", { name: "Load from wallet" })).toBeVisible();
		// Wallet not connected — load is disabled (honest state)
		await expect(header.getByRole("button", { name: "Load from wallet" })).toBeDisabled();
	});
});
