import Image from "next/image";
import { useRouter } from "next/router";
import { useConfig } from "nextra-theme-docs";

/**
 * Docs theme — keep Nextra separate from the app, but match Ledger Signal colors
 * so docs.transferagentprotocol.xyz does not feel like a different product.
 */
const themeConfig = {
	logo: (
		<>
			<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={40} height={40} />
			<span style={{ marginLeft: "0.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
				Transfer Agent Protocol
			</span>
		</>
	),
	project: {
		link: "https://github.com/transfer-agent-protocol/tap-cap-table",
	},
	docsRepositoryBase: "https://github.com/transfer-agent-protocol/tap-cap-table/tree/main/docs",
	// Dark-first to match app
	darkMode: true,
	nextThemes: {
		defaultTheme: "dark",
		forcedTheme: "dark",
	},
	// Nextra maps hue → primary (approx chartreuse ~75°)
	color: {
		hue: { dark: 72, light: 72 },
		saturation: { dark: 86, light: 86 },
	},
	primaryHue: 72,
	primarySaturation: 86,
	footer: {
		content: (
			<span style={{ fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: "0.8rem" }}>
				Copyright {new Date().getFullYear()} © PALMER.EARTH CORP ·{" "}
				<a href="https://x.com/thatalexpalmer" target="_blank" rel="noopener noreferrer">
					@thatalexpalmer
				</a>
			</span>
		),
	},
	useNextSeoProps() {
		return {
			titleTemplate: "%s – Transfer Agent Protocol",
		};
	},
	head: () => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const { asPath, defaultLocale, locale } = useRouter();
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const { frontMatter } = useConfig();

		const url =
			"https://docs.transferagentprotocol.xyz" +
			(defaultLocale === locale ? asPath : `/${locale}${asPath}`);

		return (
			<>
				<meta charSet="utf-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta
					name="viewport"
					content="width=device-width,initial-scale=1,minimum-scale=1,user-scalable=yes"
				/>
				<meta name="author" content="Transfer Agent Protocol - Documentation" />
				<meta property="og:url" content={url} />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Transfer Agent Protocol - Documentation" />
				<meta
					property="og:title"
					content={frontMatter.title || "Transfer Agent Protocol - Documentation"}
				/>
				<meta
					property="og:description"
					content={
						frontMatter.description ||
						"Transfer Agent Protocol documentation for developers. Mint onchain cap tables, issue shares, deploy the protocol on your chain or network."
					}
				/>

				<link rel="canonical" href="https://docs.transferagentprotocol.xyz" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#09090b" />
				<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
				<meta name="theme-color" content="#09090b" />
				<meta name="msapplication-TileColor" content="#09090b" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
					rel="stylesheet"
				/>
			</>
		);
	},
};

export default themeConfig;
