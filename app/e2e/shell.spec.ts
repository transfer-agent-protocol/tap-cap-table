import { expect, test } from "@playwright/test";
import { mockApi, seedMyIssuers } from "./mocks";

/** App drawer breakpoint (theme.breakpoints.tablet). iPad portrait (810px) gets the persistent sidebar. */
const DRAWER_BREAKPOINT = 768;

test.beforeEach(async ({ page }) => {
	await mockApi(page);
	await seedMyIssuers(page);
});

test.describe("app shell", () => {
	test("workspace routes show the side nav and system top bar", async ({ page }) => {
		const phone = (page.viewportSize()?.width ?? 1280) <= DRAWER_BREAKPOINT;
		await page.goto("/app/companies");

		await expect(page.getByTestId("app-shell")).toHaveAttribute("data-workspace", "1");

		// Top bar is system-only: wallet present, no section title
		const topNav = page.getByTestId("top-nav");
		await expect(topNav).toBeVisible();
		await expect(page.getByTestId("top-nav-account")).toBeVisible();
		await expect(page.getByTestId("top-nav-title")).toHaveCount(0);

		// "Where am I" is answered in-page, not in the top bar
		await expect(page.getByTestId("page-title")).toHaveText("Your companies");

		if (!phone) {
			// Side nav (working nav) visible with app destinations
			const drawer = page.getByTestId("left-nav-drawer");
			await expect(drawer).toBeVisible();
			await expect(drawer.locator("[data-nav-id='companies']")).toBeVisible();
			await expect(drawer.locator("[data-nav-id='mint']")).toBeVisible();
		}
	});

	test("desktop collapse toggle shrinks the side nav to a rail", async ({ page }) => {
		test.skip(
			(page.viewportSize()?.width ?? 1280) <= DRAWER_BREAKPOINT,
			"Collapse rail applies above the drawer breakpoint",
		);
		await page.goto("/app/companies");

		const shell = page.getByTestId("app-shell");
		await expect(shell).toHaveAttribute("data-nav-collapsed", "0");

		await page.getByTestId("nav-collapse-toggle").click();
		await expect(shell).toHaveAttribute("data-nav-collapsed", "1");
		// Nav links hidden in rail mode
		await expect(page.locator("[data-nav-id='companies']")).toHaveCount(0);

		await page.getByTestId("nav-collapse-toggle").click();
		await expect(shell).toHaveAttribute("data-nav-collapsed", "0");
		await expect(page.locator("[data-nav-id='companies']")).toBeVisible();
	});

	test("mobile menu toggle opens the drawer overlay", async ({ page }) => {
		test.skip(
			(page.viewportSize()?.width ?? 1280) > DRAWER_BREAKPOINT,
			"Drawer overlay applies at phone widths only",
		);
		await page.goto("/app/companies");

		const drawer = page.getByTestId("left-nav-drawer");
		await expect(drawer).not.toBeInViewport();

		await page.getByTestId("mobile-nav-toggle").click();
		await expect(drawer).toBeInViewport();

		// Backdrop click closes it
		await page.getByTestId("nav-drawer-overlay").click({ position: { x: 300, y: 300 } });
		await expect(drawer).not.toBeInViewport();
	});
});
