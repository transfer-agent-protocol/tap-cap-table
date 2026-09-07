import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";
import type { Abi } from "viem";

/** Write hooks the product uses today, plus acceptStock for upcoming UI. */
const KEEP_WRITES: Record<string, ReadonlySet<string>> = {
	CapTable: new Set([
		"acceptStock",
		"createStakeholder",
		"createStockClass",
		"issueStock",
		"transferStock",
	]),
	CapTableFactory: new Set(["createCapTable"]),
};

function writeOnlyAbi(abi: Abi, keep: ReadonlySet<string>): Abi {
	return abi.filter((item) => {
		if (item.type !== "function") return false;
		if (item.stateMutability === "view" || item.stateMutability === "pure") return false;
		return keep.has(item.name);
	}) as Abi;
}

const reactPlugin = react();

export default defineConfig({
	out: "src/generated.ts",
	plugins: [
		foundry({
			project: "../chain",
			include: [
				"CapTableFactory.sol/CapTableFactory.json",
				"CapTable.sol/CapTable.json",
			],
		}),
		{
			name: "React (wallet writes)",
			async run(args) {
				const contracts = args.contracts.map((contract) => {
					const keep = KEEP_WRITES[contract.name];
					if (!keep) return { ...contract, abi: [] as Abi };
					return { ...contract, abi: writeOnlyAbi(contract.abi as Abi, keep) };
				});
				const result = await reactPlugin.run!({ ...args, contracts });
				const blocks = (result.content || "").split("\n\n").filter((block) =>
					/export const useWrite/.test(block),
				);
				return {
					imports: "import { createUseWriteContract } from 'wagmi/codegen'\n",
					content: blocks.join("\n\n"),
				};
			},
		},
	],
});
