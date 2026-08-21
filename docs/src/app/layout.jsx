import { IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import { TableEnhancer } from "../components/ResponsiveTable";
import "../styles/globals.css";

const plexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

export const metadata = {
	metadataBase: new URL("https://docs.transferagentprotocol.xyz"),
	title: {
		default: "Transfer Agent Protocol",
		template: "%s – Transfer Agent Protocol",
	},
	description:
		"Transfer Agent Protocol documentation for developers. Mint onchain cap tables, issue shares, deploy the protocol on your chain or network.",
	applicationName: "Transfer Agent Protocol",
	openGraph: {
		url: "https://docs.transferagentprotocol.xyz",
		siteName: "Transfer Agent Protocol - Documentation",
		locale: "en_US",
		type: "website",
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/icons/apple-touch-icon.png",
	},
	manifest: "/manifest.json",
	other: {
		"msapplication-TileColor": "#09090b",
	},
};

const navbar = (
	<Navbar
		logo={
			<>
				<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={40} height={40} />
				<span style={{ marginLeft: "0.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
					Transfer Agent Protocol
				</span>
			</>
		}
		projectLink="https://github.com/transfer-agent-protocol/tap-cap-table"
	/>
);

const footer = (
	<Footer>
		<span style={{ fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: "0.8rem" }}>
			Copyright {new Date().getFullYear()} © PALMER.EARTH CORP ·{" "}
			<a href="https://x.com/thatalexpalmer" target="_blank" rel="noopener noreferrer">
				@thatalexpalmer
			</a>
		</span>
	</Footer>
);

export default async function RootLayout({ children }) {
	const pageMap = await getPageMap();
	return (
		<html lang="en" dir="ltr" suppressHydrationWarning className={plexMono.className}>
			<Head
				color={{
					hue: { dark: 72, light: 72 },
					saturation: { dark: 86, light: 86 },
				}}
			>
				<meta name="theme-color" content="#09090b" />
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#09090b" />
			</Head>
			<body>
				<Layout
					navbar={navbar}
					footer={footer}
					pageMap={pageMap}
					docsRepositoryBase="https://github.com/transfer-agent-protocol/tap-cap-table/tree/main/docs"
					darkMode
					nextThemes={{
						defaultTheme: "dark",
						forcedTheme: "dark",
					}}
				>
					<TableEnhancer />
					{children}
				</Layout>
			</body>
		</html>
	);
}
