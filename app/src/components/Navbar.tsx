import styled from "styled-components";
import dynamic from "next/dynamic";
import { Nav, NavBrand, NavTitle } from "./wrappers";
import { WalletButtonStyled } from "./buttons";
import { useAppShell } from "./AppShellContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { CAP_TABLE_SECTIONS, parseCapTableView } from "./navConfig";

const NavActions = styled.span`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-left: auto;
`;

const CollapseToggle = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2.25rem;
	height: 2.25rem;
	padding: 0;
	border: 1px solid ${({ theme }) => theme.colors.outline};
	background: ${({ theme }) => theme.colors.background};
	color: ${({ theme }) => theme.colors.text};
	font-size: ${({ theme }) => theme.fontSizes.medium};
	cursor: pointer;
	border-radius: ${({ theme }) => theme.radii.sm};
	transition: background ${({ theme }) => theme.transitions.default};

	&:hover {
		background: ${({ theme }) => theme.colors.input};
	}
`;

const BrandLink = styled.div`
	display: inline-flex;
	align-items: center;
	min-width: 40px;
	min-height: 40px;

	a {
		display: inline-flex;
		line-height: 0;
	}
`;

const AccountMeta = styled.span`
	display: none;
	font-size: ${({ theme }) => theme.fontSizes.small};
	opacity: 0.65;
	white-space: nowrap;

	@media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: inline;
	}
`;

const ROUTE_TITLES: Record<string, string> = {
	"/": "Onchain cap tables",
	"/mint": "Mint Cap Table",
	"/manage": "Manage Cap Tables",
	"/manage/cap-table": "Cap Table Manager",
};

// Client-only: useAppKit requires createAppKit to have been called (client-side only)
const WalletButton = dynamic(() => import("./WalletButtonClient"), {
	ssr: false,
	loading: () => <WalletButtonStyled>Connect Wallet</WalletButtonStyled>,
});

/**
 * Top primary nav: brand/context + account/wallet chrome.
 * Page navigation lives in the left collapsible drawer — not here.
 */
export default function Navbar() {
	const { pathname, query } = useRouter();
	const { collapsed, toggleCollapsed, mobileOpen, toggleMobileOpen } = useAppShell();

	let title = ROUTE_TITLES[pathname] || "Transfer Agent Protocol";

	if (pathname === "/manage/cap-table") {
		const view = parseCapTableView(query.view as string | undefined);
		const section = CAP_TABLE_SECTIONS.find((s) => s.id === view);
		if (section) {
			title = section.label;
		}
	}

	const handleToggle = () => {
		// Mobile: open/close overlay. Desktop: collapse rail.
		if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
			toggleMobileOpen();
		} else {
			toggleCollapsed();
		}
	};

	const toggleLabel =
		typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
			? mobileOpen
				? "Close navigation"
				: "Open navigation"
			: collapsed
				? "Expand navigation"
				: "Collapse navigation";

	return (
		<Nav data-testid="top-nav" role="banner">
			<NavBrand>
				<CollapseToggle
					type="button"
					onClick={handleToggle}
					aria-label={toggleLabel}
					title={toggleLabel}
					data-testid="nav-collapse-toggle"
				>
					☰
				</CollapseToggle>
				<BrandLink>
					<Link href="/" aria-label="Home">
						<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={40} height={40} />
					</Link>
				</BrandLink>
				{title && <NavTitle data-testid="top-nav-title">{title}</NavTitle>}
			</NavBrand>
			<NavActions data-testid="top-nav-account">
				<AccountMeta>Account</AccountMeta>
				<WalletButton />
			</NavActions>
		</Nav>
	);
}
