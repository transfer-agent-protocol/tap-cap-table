import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Providers from "./providers";

const plex = IBM_Plex_Mono({
	weight: ["400", "500", "600", "700"],
	style: ["normal", "italic"],
	subsets: ["latin-ext"],
	display: "swap",
	preload: true,
});

export const metadata: Metadata = {
	authors: [{ name: "Transfer Agent Protocol" }],
	description:
		"Mint equity cap tables onchain. Open-source and regulatory compliant infrastructure for tokenized capital markets and transfer agents.",
	title: "Transfer Agent Protocol",
	openGraph: {
		type: "website",
		siteName: "Transfer Agent Protocol",
		url: "https://transferagentprotocol.xyz",
		title: "Transfer Agent Protocol",
		description:
			"Mint equity cap tables onchain. Open-source and regulatory compliant infrastructure for tokenized capital markets and transfer agents.",
	},
	alternates: {
		canonical: "https://transferagentprotocol.xyz",
	},
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
		other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg" }],
	},
	other: {
		"msapplication-TileColor": "#0c0b0c",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	minimumScale: 1,
	userScalable: true,
	themeColor: "#fafafc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={plex.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
