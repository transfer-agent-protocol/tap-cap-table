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
	gap: ${({ theme }) => theme.spacing.md};
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
	background: ${({ theme }) => theme.colors.elevated};
	color: ${({ theme }) => theme.colors.muted};
	font-size: 1rem;
	line-height: 1;
	cursor: pointer;
	border-radius: ${({ theme }) => theme.radii.sm};
	transition: background ${({ theme }) => theme.transitions.default},
		border-color ${({ theme }) => theme.transitions.default},
		color ${({ theme }) => theme.transitions.default};

	&:hover {
		background: ${({ theme }) => theme.colors.input};
		border-color: ${({ theme }) => theme.colors.borderStrong};
		color: ${({ theme }) => theme.colors.text};
	}
`;

const BrandLink = styled.div`
	display: inline-flex;
	align-items: center;
	border-radius: ${({ theme }) => theme.radii.sm};
	overflow: hidden;
	line-height: 0;
	border: 1px solid ${({ theme }) => theme.colors.outline};
	background: ${({ theme }) => theme.colors.elevated};

	a {
		display: inline-flex;
		line-height: 0;
	}
`;

const TitleStack = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.1rem;
	min-width: 0;
`;

const TitleMeta = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
	white-space: nowrap;
`;

const LiveDot = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
	white-space: nowrap;

	&::before {
		content: "";
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: ${({ theme }) => theme.colors.success};
		box-shadow: 0 0 8px ${({ theme }) => theme.colors.success};
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: none;
	}
`;

const ROUTE_TITLES: Record<string, string> = {
	"/": "Home",
	"/mint": "Mint Cap Table",
	"/manage": "Manage Cap Tables",
	"/manage/cap-table": "Cap Table Manager",
};

const ROUTE_META: Record<string, string> = {
	"/": "Protocol",
	"/mint": "Deploy",
	"/manage": "Admin",
	"/manage/cap-table": "Issuer",
};

const WalletButton = dynamic(() => import("./WalletButtonClient"), {
	ssr: false,
	loading: () => <WalletButtonStyled>Connect Wallet</WalletButtonStyled>,
});

/**
 * Top primary chrome: brand/context + account/wallet.
 * Page navigation lives in the left drawer.
 */
export default function Navbar() {
	const { pathname, query } = useRouter();
	const { collapsed, toggleCollapsed, mobileOpen, toggleMobileOpen } = useAppShell();

	let title = ROUTE_TITLES[pathname] || "Transfer Agent Protocol";
	let meta = ROUTE_META[pathname] || "TAP";

	if (pathname === "/manage/cap-table") {
		const view = parseCapTableView(query.view as string | undefined);
		const section = CAP_TABLE_SECTIONS.find((s) => s.id === view);
		if (section) {
			title = section.label;
			meta = "Cap Table";
		}
	}

	const handleToggle = () => {
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
					{collapsed ? "›" : "‹"}
				</CollapseToggle>
				<BrandLink>
					<Link href="/" aria-label="Home">
						<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={36} height={36} />
					</Link>
				</BrandLink>
				<TitleStack>
					<TitleMeta>{meta}</TitleMeta>
					{title && <NavTitle data-testid="top-nav-title">{title}</NavTitle>}
				</TitleStack>
			</NavBrand>
			<NavActions data-testid="top-nav-account">
				<LiveDot>Onchain</LiveDot>
				<WalletButton />
			</NavActions>
		</Nav>
	);
}
