import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
	out: "src/generated.ts",
	plugins: [
		foundry({
			project: "../chain",
			include: ["CapTableFactory.sol/CapTableFactory.json"],
		}),
		react(),
	],
});
