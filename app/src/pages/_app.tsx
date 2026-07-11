import { useEffect } from "react";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import Head from "next/head";
import { ThemeProvider } from "styled-components";
import theme from "../components/theme";
import GlobalStyle from "../components/globalstyle";
import { IBM_Plex_Mono } from "next/font/google";

import Layout from "../components/layout";
import { AppShellProvider } from "../components/AppShellContext";
import Web3Provider from "../config/Web3Provider";

const plex = IBM_Plex_Mono({
	weight: ["400", "500", "600", "700"],
	style: ["normal", "italic"],
	subsets: ["latin-ext"],
	display: "swap",
	preload: true,
});

function isExtensionNoise(msg: string, source?: string, stack?: string): boolean {
	const m = msg || "";
	const s = `${source || ""} ${stack || ""}`;
	return (
		s.includes("chrome-extension://") ||
		s.includes("moz-extension://") ||
		s.includes("safari-extension://") ||
		s.includes("injected.js") ||
		m.includes("ERR_BLOCKED_BY_CLIENT") ||
		m.includes("AnalyticsSDK") ||
		m.includes("pulse.walletconnect") ||
		// Wallet extensions often surface bare TypeError: Failed to fetch
		(m.includes("Failed to fetch") &&
			(s.includes("extension") || s.includes("injected") || s.includes("wallet") || !s.trim()))
	);
}

export default function App({ Component, pageProps }: AppProps & { Component: NextPage<any> }) {
	// Wallet / adblock extensions throw "Failed to fetch" into the page; Next's
	// dev overlay treats them as app errors. Swallow that noise only.
	useEffect(() => {
		const onRejection = (e: PromiseRejectionEvent) => {
			const msg = e.reason?.message || String(e.reason || "");
			const stack = e.reason?.stack || "";
			if (isExtensionNoise(msg, "", stack)) {
				e.preventDefault();
				e.stopImmediatePropagation?.();
			}
		};
		const onError = (e: ErrorEvent) => {
			const msg = e.message || String(e.error || "");
			const stack = e.error?.stack || "";
			if (isExtensionNoise(msg, e.filename || "", stack)) {
				e.preventDefault();
				e.stopImmediatePropagation?.();
			}
		};
		// Capture phase so we run before Next's overlay listeners
		window.addEventListener("unhandledrejection", onRejection, true);
		window.addEventListener("error", onError, true);
		return () => {
			window.removeEventListener("unhandledrejection", onRejection, true);
			window.removeEventListener("error", onError, true);
		};
	}, []);

	return (
		<Web3Provider>
			<ThemeProvider theme={theme}>
				<GlobalStyle />
				<AppShellProvider>
					<Layout className={plex.className}>
						<Head>
							<meta charSet="utf-8" />
							<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
							<meta
								name="viewport"
								content="width=device-width,initial-scale=1,minimum-scale=1,user-scalable=yes"
							/>
							<meta name="author" content="Transfer Agent Protocol" />
							<meta
								name="description"
								content="Mint equity cap tables onchain. Open-source infrastructure for tokenized capital markets and transfer agents."
							/>
							<title>Transfer Agent Protocol</title>
							<meta property="og:type" content="website" />
							<meta property="og:site_name" content="Transfer Agent Protocol" />
							<meta property="og:url" content="https://transferagentprotocol.xyz" />
							<meta property="og:title" content="Transfer Agent Protocol" />
							<meta
								property="og:description"
								content="Mint equity cap tables onchain. Open-source infrastructure for tokenized capital markets and transfer agents."
							/>
							<link rel="canonical" href="https://transferagentprotocol.xyz" />
							<link rel="manifest" href="/manifest.json" />
							<link rel="icon" href="/favicon.ico" />
							<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
							<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
							<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#09090b" />
							<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
							<meta name="theme-color" content="#09090b" />
							<meta name="msapplication-TileColor" content="#09090b" />
						</Head>
						<Component {...pageProps} />
					</Layout>
				</AppShellProvider>
			</ThemeProvider>
		</Web3Provider>
	);
}
