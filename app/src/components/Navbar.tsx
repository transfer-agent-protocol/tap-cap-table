import styled from "styled-components";
import dynamic from "next/dynamic";
import { Nav, NavBrand, NavTitle } from "./wrappers";
import { InlineButton, LogoRouter, StyledA, WalletButtonStyled } from "./buttons";
import { useCapTableMenu } from "./CapTableMenuContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const NavActions = styled.span`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
`;

// Route-derived titles are rendered in the navbar so individual pages
// don't need to repeat the page heading in their body.
const ROUTE_TITLES: Record<string, string> = {
	"/": "Onchain cap tables.",
	"/mint": "Mint Cap Table",
	"/manage": "Manage Cap Tables",
	"/manage/cap-table": "Cap Table Manager",
};

// Client-only: useAppKit requires createAppKit to have been called (client-side only)
const WalletButton = dynamic(() => import("./WalletButtonClient"), {
	ssr: false,
	loading: () => <WalletButtonStyled>Connect Wallet</WalletButtonStyled>,
});

export default function Navbar() {
	const { pathname } = useRouter();
	const { isEnabled: isMenuEnabled, setOpen: setMenuOpen } = useCapTableMenu();

	// Mint/Manage links and the wallet button live in the navbar only while the
	// user is actively on an app route. Docs and Github stay visible on every
	// page so the landing page keeps the original outbound links.
	const isAppRoute = pathname === "/mint" || pathname.startsWith("/manage");
	const title = ROUTE_TITLES[pathname];

	return (
		<Nav>
			<NavBrand>
				<LogoRouter>
					<Link href="/">
						<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={48} height={48} />
					</Link>
				</LogoRouter>
				{title && <NavTitle>{title}</NavTitle>}
			</NavBrand>
			<NavActions>
				{isAppRoute && (
					<>
						<StyledA>
							<Link href="/mint">Mint</Link>
						</StyledA>
						<StyledA>
							<Link href="/manage">Manage</Link>
						</StyledA>
					</>
				)}
				<StyledA>
					<Link href="https://docs.transferagentprotocol.xyz" target="_blank">Docs</Link>
				</StyledA>
				<StyledA>
					<Link href="https://github.com/transfer-agent-protocol/tap-cap-table" target="_blank">Github</Link>
				</StyledA>
				{isMenuEnabled && (
					<InlineButton onClick={() => setMenuOpen(true)} $variant="primary" title="Open cap table navigation">
						☰ Menu
					</InlineButton>
				)}
				{isAppRoute && <WalletButton />}
			</NavActions>
		</Nav>
	);
}
