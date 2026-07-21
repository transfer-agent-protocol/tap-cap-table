import { useEffect } from "react";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import Head from "next/head";
import { ThemeProvider } from "styled-components";
import theme from "../components/theme";
import GlobalStyle from "../components/global-style";
import { IBM_Plex_Mono, Inter } from "next/font/google";

import AppShell from "../components/shell/AppShell";
import { AppShellProvider } from "../components/shell/AppShellContext";
import Web3Provider from "../config/Web3Provider";

// Sans for UI copy; mono reserved for data (numbers, addresses, tables).
const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-sans",
});

const plex = IBM_Plex_Mono({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin-ext"],
	display: "swap",
	variable: "--font-mono",
});

function isExtensionNoise(msg: string, source?: string, stack?: string): boolean {
	const m = msg || "";
	const s = `${source || ""} ${stack || ""}`;
	// Bare "Failed to fetch" with no real app stack is almost always wallet extension /
	// adblock (ERR_BLOCKED_BY_CLIENT) — not TAP API.
	const bareFailedFetch =
		m === "Failed to fetch" ||
		m === "TypeError: Failed to fetch" ||
		m.includes("TypeError: Failed to fetch");
	const nonAppStack =
		!s.trim() ||
		s.includes("<anonymous>") ||
		s.includes("chrome-extension://") ||
		s.includes("moz-extension://") ||
		s.includes("safari-extension://") ||
		s.includes("injected.js") ||
		s.includes("extension") ||
		s.includes("wallet") ||
		s.includes("coinbase") ||
		s.includes("web3modal");
	return (
		s.includes("chrome-extension://") ||
		s.includes("moz-extension://") ||
		s.includes("safari-extension://") ||
		s.includes("injected.js") ||
		m.includes("ERR_BLOCKED_BY_CLIENT") ||
		m.includes("AnalyticsSDK") ||
		m.includes("cca-lite.coinbase.com") ||
		(bareFailedFetch && nonAppStack)
	);
}

const fontVariableClasses = `${inter.variable} ${plex.variable}`;

export default function App({ Component, pageProps }: AppProps & { Component: NextPage<any> }) {
	// Put next/font CSS variables on <html> so portaled UI (modals on document.body)
	// resolves --font-sans / --font-mono the same as the app shell.
	useEffect(() => {
		const root = document.documentElement;
		const classes = fontVariableClasses.split(/\s+/).filter(Boolean);
		root.classList.add(...classes);
		return () => root.classList.remove(...classes);
	}, []);

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
					<AppShell className={fontVariableClasses}>
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
							<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0a0a0a" />
							<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
							<meta name="theme-color" content="#0a0a0a" />
							<meta name="msapplication-TileColor" content="#0a0a0a" />
						</Head>
						<Component {...pageProps} />
					</AppShell>
				</AppShellProvider>
			</ThemeProvider>
		</Web3Provider>
	);
}
