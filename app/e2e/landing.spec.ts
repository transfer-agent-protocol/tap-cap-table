import { expect, test } from "@playwright/test";
import { mockApi } from "./mocks";

test.beforeEach(async ({ page }) => {
	await mockApi(page);
});

test.describe("landing page", () => {
	test("renders marketing content without workspace chrome", async ({ page }) => {
		await page.goto("/");

		await expect(page.getByTestId("home-page")).toBeVisible();
		// Marketing gets no side nav and no wallet
		await expect(page.getByTestId("app-shell")).toHaveAttribute("data-workspace", "0");
		await expect(page.getByTestId("left-nav-drawer")).toHaveCount(0);
		await expect(page.getByTestId("top-nav-account").getByText("Connect")).toHaveCount(0);

		// Demo contracts table renders
		await expect(page.getByRole("cell", { name: "CapTableFactory" })).toBeVisible();
	});

	test("top bar shows Docs and GitHub links on desktop/tablet", async ({ page, isMobile }) => {
		test.skip(Boolean(isMobile), "External links are hidden on phone widths");
		await page.goto("/");

		const account = page.getByTestId("top-nav-account");
		await expect(account.getByRole("link", { name: "Docs" })).toBeVisible();
		await expect(account.getByRole("link", { name: "GitHub" })).toBeVisible();
	});
});
