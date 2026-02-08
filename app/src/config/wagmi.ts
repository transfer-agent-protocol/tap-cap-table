import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit";
import { type AppKitNetwork } from "@reown/appkit/networks";

// Plume Mainnet (98866)
const plumeMainnet = {
	id: 98866,
	name: "Plume",
	nativeCurrency: { name: "Plume", symbol: "PLUME", decimals: 18 },
	rpcUrls: {
		default: { http: ["https://rpc.plume.org"] },
	},
	blockExplorers: {
		default: { name: "Plume Explorer", url: "https://explorer.plume.org" },
	},
} as const satisfies AppKitNetwork;

// Plume Testnet (98867)
const plumeTestnet = {
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
} as const satisfies AppKitNetwork;

// Anvil local (31337)
const anvil = {
	id: 31337,
	name: "Anvil",
	nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
	rpcUrls: {
		default: { http: ["http://127.0.0.1:8545"] },
	},
	testnet: true,
} as const satisfies AppKitNetwork;

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [plumeMainnet, plumeTestnet, anvil];

export const wagmiAdapter = new WagmiAdapter({
	networks,
	projectId,
});

if (typeof window !== "undefined") {
	createAppKit({
		adapters: [wagmiAdapter],
		networks,
		projectId,
		metadata: {
			name: "Transfer Agent Protocol",
			description: "Mint equity cap tables onchain",
			url: "https://transferagentprotocol.xyz",
			icons: ["/tap-logo.svg"],
		},
		features: {
			analytics: false,
		},
	});
}
