import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
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
	ssr: true,
});

// Wallet IDs (Reown explorer)
const RABBY = "18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1";
const ZERION = "ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18";
const BINANCE = "8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4";

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
		featuredWalletIds: [RABBY, ZERION],
		excludeWalletIds: [BINANCE],
		allWallets: "HIDE",
		themeMode: "light" as const,
		themeVariables: {
			"--w3m-accent": "#0C0B0C",
			"--w3m-color-mix": "#0C0B0C",
			"--w3m-color-mix-strength": 0,
			"--w3m-border-radius-master": "0px",
			"--w3m-font-family": "inherit",
		},
		features: {
			analytics: false,
			email: false,
			socials: false,
		},
	});
}
