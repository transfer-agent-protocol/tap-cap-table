import { expect, test } from "@playwright/test";
import { mockApi, seedMyIssuers } from "./mocks";

test.beforeEach(async ({ page }) => {
	await mockApi(page);
	await seedMyIssuers(page);
});

test.describe("native wallet modal", () => {
	test("shows Connect Wallet and opens the modal", async ({ page }) => {
		await page.goto("/app/companies");

		const connect = page.getByTestId("wallet-connect-button");
		await expect(connect).toBeVisible();
		await expect(connect).toContainText(/Connect Wallet|Connect/i);

		await connect.click();
		const modal = page.getByTestId("wallet-modal");
		await expect(modal).toBeVisible();
		// At least the dialog title from Modal
		await expect(page.getByRole("dialog")).toBeVisible();
	});

	test("closes the wallet modal with Escape", async ({ page }) => {
		await page.goto("/app/companies");
		await page.getByTestId("wallet-connect-button").click();
		await expect(page.getByTestId("wallet-modal")).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(page.getByTestId("wallet-modal")).toHaveCount(0);
	});

	test("lists a wallet option when ethereum is injected", async ({ page }) => {
		await page.addInitScript(() => {
			// Minimal EIP-1193 stub so the generic Injected connector is "detected"
			(window as any).ethereum = {
				isMetaMask: true,
				request: async ({ method }: { method: string }) => {
					if (method === "eth_requestAccounts" || method === "eth_accounts") {
						return ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"];
					}
					if (method === "eth_chainId") return "0x18232"; // 98866
					if (method === "wallet_switchEthereumChain") return null;
					return null;
				},
				on: () => {},
				removeListener: () => {},
			};
		});

		await page.goto("/app/companies");
		await page.getByTestId("wallet-connect-button").click();
		await expect(page.getByTestId("wallet-modal")).toBeVisible();
		// Generic injected and/or EIP-6963 option rows
		const options = page.getByTestId("wallet-option");
		await expect(options.first()).toBeVisible({ timeout: 10_000 });
	});
});
