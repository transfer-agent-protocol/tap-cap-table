import styled from "styled-components";
import dynamic from "next/dynamic";
import { Nav, NavBrand, NavTitle } from "./wrappers";
import { WalletButtonStyled } from "./buttons";
import { useAppShell } from "./AppShellContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	CAP_TABLE_SECTIONS,
	isCompanyWorkspacePath,
	isWorkspaceRoute,
	parseCapTableView,
} from "./navConfig";

const NavActions = styled.span`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-left: auto;
`;

const MenuToggle = styled.button`
	display: inline-flex;
	flex-flow: column nowrap;
	align-items: center;
	justify-content: center;
	gap: 4px;
	width: 2.25rem;
	height: 2.25rem;
	padding: 0;
	border: 1px solid ${({ theme }) => theme.colors.outline};
	background: transparent;
	cursor: pointer;
	transition: border-color ${({ theme }) => theme.transitions.default},
		background ${({ theme }) => theme.transitions.default};

	span {
		display: block;
		width: 12px;
		height: 1px;
		background: ${({ theme }) => theme.colors.muted};
		transition: background ${({ theme }) => theme.transitions.default};
	}

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
		background: ${({ theme }) => theme.colors.elevated};

		span {
			background: ${({ theme }) => theme.colors.main};
		}
	}
`;

const BrandLink = styled.div`
	display: inline-flex;
	align-items: center;
	line-height: 0;

	a {
		display: inline-flex;
		line-height: 0;
	}
`;

const TopLink = styled.a`
	display: inline-flex;
	align-items: center;
	height: 2.125rem;
	padding: 0 ${({ theme }) => theme.spacing.sm};
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	color: ${({ theme }) => theme.colors.muted} !important;
	text-decoration: none !important;
	opacity: 1 !important;
	transition: color ${({ theme }) => theme.transitions.default};

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
		text-decoration: none !important;
		opacity: 1 !important;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
		display: none;
	}
`;

const WalletButton = dynamic(() => import("./WalletButtonClient"), {
	ssr: false,
	loading: () => <WalletButtonStyled>Connect</WalletButtonStyled>,
});

/**
 * Top bar.
 * Marketing (`/`): logo + Docs (+ optional GitHub) — no wallet.
 * Product (`/app/*`): menu + title + wallet.
 */
export default function Navbar() {
	const { pathname, query, asPath } = useRouter();
	const { collapsed, toggleCollapsed, mobileOpen, toggleMobileOpen, setMobileOpen } =
		useAppShell();
	const workspace = isWorkspaceRoute(pathname);
	// asPath is the real URL; pathname is the route pattern (…/[issuerId])
	const pathOnly = (asPath || "").split("?")[0];

	let title = "";
	if (pathname === "/app/mint" || pathOnly === "/app/mint") title = "New company";
	else if (pathOnly === "/app" || pathOnly === "/app/companies") title = "Companies";
	else if (isCompanyWorkspacePath(pathOnly) || typeof query.issuerId === "string") {
		const view = parseCapTableView(query.view as string | undefined);
		const section = CAP_TABLE_SECTIONS.find((s) => s.id === view);
		title = section?.label || "Company";
	}

	const handleMenu = () => {
		if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
			toggleMobileOpen();
		} else {
			toggleCollapsed();
		}
	};

	const menuLabel =
		typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
			? mobileOpen
				? "Close menu"
				: "Open menu"
			: collapsed
				? "Show sidebar"
				: "Hide sidebar";

	return (
		<Nav data-testid="top-nav" role="banner">
			<NavBrand>
				{workspace && (
					<MenuToggle
						type="button"
						onClick={handleMenu}
						aria-label={menuLabel}
						title={menuLabel}
						data-testid="nav-collapse-toggle"
					>
						<span />
						<span />
						<span />
					</MenuToggle>
				)}
				<BrandLink>
					<Link href="/" aria-label="Home" onClick={() => setMobileOpen(false)}>
						<Image
							src="/tap-logo.svg"
							alt="Transfer Agent Protocol"
							width={32}
							height={32}
						/>
					</Link>
				</BrandLink>
				{workspace && title && <NavTitle data-testid="top-nav-title">{title}</NavTitle>}
			</NavBrand>
			<NavActions data-testid="top-nav-account">
				{!workspace && (
					<>
						<TopLink
							href="https://docs.transferagentprotocol.xyz"
							target="_blank"
							rel="noopener noreferrer"
						>
							Docs
						</TopLink>
						<TopLink
							href="https://github.com/transfer-agent-protocol/tap-cap-table"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</TopLink>
					</>
				)}
				{workspace && <WalletButton />}
			</NavActions>
		</Nav>
	);
}
