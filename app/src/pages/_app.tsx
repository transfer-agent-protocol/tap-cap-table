import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import Head from "next/head";
import { useEffect } from "react";
import { ThemeProvider } from "styled-components";
import theme from "../components/theme";
import GlobalStyle from "../components/globalstyle";
import { IBM_Plex_Mono } from 'next/font/google';
import TagManager from "react-gtm-module";

import Layout from "../components/layout";

// Configure our font object
const plex = IBM_Plex_Mono({
	// Pass the font weights you want to use
	weight: ['400', '500', '600', '700',],
	style: ['normal', 'italic'],
	// Pass the font display strategy you want to use
	subsets: ['latin-ext'],
	display: 'swap',
	preload: true,
});

export default function App({ Component, pageProps }: AppProps & { Component: NextPage<any> }) {
	return (
		<ThemeProvider theme={theme}>
			<GlobalStyle />
			<Layout className={plex.className}>
				<Head>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,user-scalable=yes" />
					<meta name="author" content="Transfer Agent Protocol" />
					<meta
						name="description"
						content="Mint equity cap tables onchain. Open-source and regulatory compliant infrastructured for tokenized capital markets and transfer agents."
					/>

					<title>Transfer Agent Protocol</title>

					<meta property="og:type" content="website" />
					<meta property="og:site_name" content="Transfer Agent Protocol" />
					<meta property="og:url" content="https://transferagentprotocol.xyz" />
					<meta property="og:title" content="Transfer Agent Protocol" />
					<meta
						property="og:description"
						content="Mint equity cap tables onchain. Open-source and regulatory compliant infrastructured for tokenized capital markets and transfer agents."
					/>
					<link rel="canonical" href="https://transferagentprotocol.xyz" />

					<link rel="manifest" href="/manifest.json" />

					<link rel="icon" href="/favicon.ico" />

					<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

					<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

					<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0c0b0c" />
					<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
					<meta name="theme-color" content="#fafafc" />
					<meta name="msapplication-TileColor" content="#0c0b0c" />
					<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

				</Head>
				<Component {...pageProps} />
			</Layout>
		</ThemeProvider>
	);
}
