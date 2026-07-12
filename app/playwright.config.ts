import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite for the TAP app.
 * All /api/* traffic is mocked per-test (see e2e/mocks.ts) — no Mongo/chain needed.
 * Three viewports: desktop, iPad portrait, iPhone. All run in Chromium.
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: "http://localhost:3100",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "desktop",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "ipad",
			use: {
				...devices["iPad (gen 7)"],
				browserName: "chromium",
			},
		},
		{
			name: "iphone",
			use: {
				...devices["iPhone 13"],
				browserName: "chromium",
			},
		},
	],
	// Production server: no dev overlay portal to intercept clicks, real output.
	webServer: {
		command: "pnpm exec next build && pnpm exec next start -p 3100",
		url: "http://localhost:3100",
		reuseExistingServer: !process.env.CI,
		timeout: 240_000,
	},
});
