"use client";

import { useEffect } from "react";
import { ThemeProvider } from "styled-components";
import theme from "../components/theme";
import GlobalStyle from "../components/globalstyle";
import Layout from "../components/layout";
import Web3Provider from "../config/Web3Provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	// Suppress unhandled rejections from wallet SDK analytics blocked by ad blockers
	useEffect(() => {
		const handler = (e: PromiseRejectionEvent) => {
			const msg = e.reason?.message || String(e.reason || "");
			if (
				msg.includes("Failed to fetch") ||
				msg.includes("ERR_BLOCKED_BY_CLIENT") ||
				msg.includes("AnalyticsSDK") ||
				msg.includes("pulse.walletconnect")
			) {
				e.preventDefault();
			}
		};
		window.addEventListener("unhandledrejection", handler);
		return () => window.removeEventListener("unhandledrejection", handler);
	}, []);

	return (
		<Web3Provider>
			<ThemeProvider theme={theme}>
				<GlobalStyle />
				<Layout>{children}</Layout>
			</ThemeProvider>
		</Web3Provider>
	);
}
