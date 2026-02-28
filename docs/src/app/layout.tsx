import type { Metadata, Viewport } from "next";
import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import themeConfig from "../../theme.config";

export const metadata: Metadata = {
    title: {
        template: "%s – Transfer Agent Protocol",
        default: "Transfer Agent Protocol - Documentation",
    },
    description:
        "Transfer Agent Protocol documentation for developers. Mint onchain cap tables, issue shares, deploy the protocol on your chain or network.",
    authors: [{ name: "Transfer Agent Protocol - Documentation" }],
    openGraph: {
        type: "website",
        siteName: "Transfer Agent Protocol - Documentation",
    },
    alternates: {
        canonical: "https://docs.transferagentprotocol.xyz",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const pageMap = await getPageMap();
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <Head />
            <body>
                <Layout
                    navbar={
                        <Navbar
                            logo={themeConfig.logo}
                            projectLink={themeConfig.project.link}
                        />
                    }
                    pageMap={pageMap}
                    docsRepositoryBase={themeConfig.docsRepositoryBase}
                    footer={themeConfig.footer.text}
                >
                    {children}
                </Layout>
            </body>
        </html>
    );
}
