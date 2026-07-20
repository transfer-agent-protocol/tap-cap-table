import { createConfig, http, injected, mock, type Config, type CreateConnectorFn } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import type { Chain } from "viem";
import * as viemChains from "viem/chains";

// Plume Mainnet (98866)
export const plumeMainnet = {
	id: 98866,
	name: "Plume",
	nativeCurrency: { name: "Plume", symbol: "PLUME", decimals: 18 },
	rpcUrls: {
		default: { http: ["https://rpc.plume.org"] },
	},
	blockExplorers: {
		default: { name: "Plume Explorer", url: "https://explorer.plume.org" },
	},
} as const satisfies Chain;

// Plume Testnet (98867)
export const plumeTestnet = {
	id: 98867,
	name: "Plume Testnet",
	nativeCurrency: { name: "Plume", symbol: "PLUME", decimals: 18 },
	rpcUrls: {
		default: { http: ["https://testnet-rpc.plume.org"] },
	},
	blockExplorers: {
		default: { name: "Plume Testnet Explorer", url: "https://testnet-explorer.plume.org" },
	},
	testnet: true,
} as const satisfies Chain;

// Anvil local (31337)
export const anvil = {
	id: 31337,
	name: "Anvil",
	nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
	rpcUrls: {
		default: { http: ["http://127.0.0.1:8545"] },
	},
	testnet: true,
} as const satisfies Chain;

/** Chains the app can use for writes / switch-network (wagmi config). */
export const chains = [plumeMainnet, plumeTestnet, anvil] as const;

/** Product chain for wrong-network UX (default Plume mainnet). */
export const productChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 98866);

/** Display/lookup only — viem ships ~700 named chains (Ethereum, Arbitrum, …). */
const namedChainsById = new Map<number, Chain>();
for (const value of Object.values(viemChains)) {
	if (value && typeof value === "object" && "id" in value && "name" in value && "nativeCurrency" in value) {
		namedChainsById.set((value as Chain).id, value as Chain);
	}
}
// Prefer our product definitions when they overlap (same id).
for (const chain of chains) {
	namedChainsById.set(chain.id, chain);
}

/** Product / configured chain only (for transports & switch targets). */
export function getChainById(chainId: number): Chain | undefined {
	return chains.find((c) => c.id === chainId);
}

/**
 * Human network name for any wallet chainId.
 * Source order: product chains → viem/chains catalog → generic label (never "Chain N").
 */
export function getChainName(chainId: number): string {
	return namedChainsById.get(chainId)?.name ?? `Unknown network (${chainId})`;
}

/** Explorer URL when the chain is known (product or viem catalog). */
export function getExplorerUrl(chainId: number | undefined, address: string): string | null {
	if (!chainId) return null;
	const chain = namedChainsById.get(chainId) ?? getChainById(chainId);
	const base = chain?.blockExplorers?.default?.url;
	if (!base) return null;
	return `${base.replace(/\/$/, "")}/address/${address}`;
}

const rawWcProjectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "").trim();

/** Optional WalletConnect (mobile QR). Unset → injected wallets only; no cloud account required. */
export const isWalletConnectConfigured =
	rawWcProjectId.length > 0 &&
	rawWcProjectId !== "UPDATE_ME" &&
	!rawWcProjectId.toLowerCase().includes("your_project");

/** Playwright / local e2e only — never enable in production builds. */
export const isWalletMockEnabled =
	process.env.NEXT_PUBLIC_WALLET_MOCK === "1" && process.env.NODE_ENV !== "production";

const metadata = {
	name: "Transfer Agent Protocol",
	description: "Mint equity cap tables onchain",
	url: "https://transferagentprotocol.xyz",
	icons: ["https://transferagentprotocol.xyz/tap-logo.svg"],
};

function buildConnectors(): CreateConnectorFn[] {
	const list: CreateConnectorFn[] = [];

	if (isWalletMockEnabled) {
		list.push(
			mock({
				accounts: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
				features: {
					reconnect: true,
				},
			}),
		);
	}

	// EIP-6963 multi-injected discovery is on by default via createConfig.
	list.push(
		injected({
			shimDisconnect: true,
		}),
	);

	if (isWalletConnectConfigured) {
		list.push(
			walletConnect({
				projectId: rawWcProjectId,
				metadata,
				showQrModal: true,
			}),
		);
	}

	return list;
}

export const config: Config = createConfig({
	chains,
	connectors: buildConnectors(),
	transports: {
		[plumeMainnet.id]: http(plumeMainnet.rpcUrls.default.http[0]),
		[plumeTestnet.id]: http(plumeTestnet.rpcUrls.default.http[0]),
		[anvil.id]: http(anvil.rpcUrls.default.http[0]),
	},
	ssr: true,
	multiInjectedProviderDiscovery: true,
});
