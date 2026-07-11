import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppShell } from "./AppShellContext";
import {
	APP_NAV_ITEMS,
	CAP_TABLE_SECTIONS,
	capTableHref,
	parseCapTableView,
	type CapTableView,
} from "./navConfig";

const Overlay = styled.div<{ $open: boolean }>`
	display: none;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: block;
		position: fixed;
		inset: 0;
		background: ${({ theme }) => theme.colors.overlay};
		opacity: ${({ $open }) => ($open ? 1 : 0)};
		pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
		transition: opacity ${({ theme }) => theme.transitions.default};
		z-index: ${({ theme }) => theme.zIndices.dropdown};
		backdrop-filter: blur(4px);
	}
`;

const Drawer = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
	position: sticky;
	top: 0;
	align-self: flex-start;
	display: flex;
	flex-flow: column nowrap;
	width: ${({ theme, $collapsed }) => ($collapsed ? theme.layout.navCollapsed : theme.layout.navWidth)};
	min-width: ${({ theme, $collapsed }) => ($collapsed ? theme.layout.navCollapsed : theme.layout.navWidth)};
	height: 100vh;
	background: ${({ theme }) => theme.colors.surface};
	border-right: 1px solid ${({ theme }) => theme.colors.outline};
	box-sizing: border-box;
	overflow-x: hidden;
	overflow-y: auto;
	transition: width ${({ theme }) => theme.transitions.slow},
		min-width ${({ theme }) => theme.transitions.slow},
		transform ${({ theme }) => theme.transitions.slow};
	z-index: ${({ theme }) => theme.zIndices.dropdown};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		position: fixed;
		left: 0;
		top: 0;
		width: ${({ theme }) => theme.layout.navWidth};
		min-width: ${({ theme }) => theme.layout.navWidth};
		transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? "0" : "-100%")});
		box-shadow: ${({ $mobileOpen, theme }) => ($mobileOpen ? theme.shadows.lg : "none")};
	}
`;

const DrawerInner = styled.div`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	padding: ${({ theme }) => theme.spacing.md} 0;
	min-height: 0;
`;

const BrandRow = styled(Link)`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	min-height: 2.75rem;
	text-decoration: none !important;
	color: inherit !important;
	opacity: 1 !important;

	&:hover {
		text-decoration: none !important;
		opacity: 1 !important;
		color: inherit !important;
	}
`;

const BrandMark = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: ${({ theme }) => theme.radii.sm};
	background: ${({ theme }) => theme.colors.main};
	color: ${({ theme }) => theme.colors.inverse};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	letter-spacing: 0.04em;
	flex-shrink: 0;
	box-shadow: ${({ theme }) => theme.shadows.glow};
`;

const BrandText = styled.span<{ $collapsed: boolean }>`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.1rem;
	min-width: 0;
	opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
	width: ${({ $collapsed }) => ($collapsed ? 0 : "auto")};
	overflow: hidden;
	transition: opacity ${({ theme }) => theme.transitions.default};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		opacity: 1;
		width: auto;
	}
`;

const BrandTitle = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text};
	white-space: nowrap;
`;

const BrandSub = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.subtle};
	letter-spacing: 0.06em;
	text-transform: uppercase;
	white-space: nowrap;
`;

const NavSection = styled.div`
	display: flex;
	flex-flow: column nowrap;
	margin-bottom: ${({ theme }) => theme.spacing.md};
	padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const NavLabel = styled.div<{ $collapsed: boolean }>`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	text-transform: uppercase;
	letter-spacing: 0.1em;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	color: ${({ theme }) => theme.colors.subtle};
	opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
	height: ${({ $collapsed }) => ($collapsed ? 0 : "auto")};
	overflow: hidden;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		opacity: 1;
		height: auto;
	}
`;

const NavLink = styled.a<{ $active?: boolean; $collapsed?: boolean }>`
	position: relative;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	padding: 0.65rem ${({ theme }) => theme.spacing.sm};
	margin-bottom: 2px;
	border-radius: ${({ theme }) => theme.radii.sm};
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ $active, theme }) =>
		$active ? theme.fontWeights.semibold : theme.fontWeights.medium};
	background: ${({ $active, theme }) => ($active ? theme.colors.accentMuted : "transparent")};
	color: ${({ $active, theme }) => ($active ? theme.colors.main : theme.colors.muted)} !important;
	text-decoration: none !important;
	opacity: 1 !important;
	cursor: pointer;
	border: none;
	width: 100%;
	box-sizing: border-box;
	text-align: left;
	transition: background ${({ theme }) => theme.transitions.default},
		color ${({ theme }) => theme.transitions.default};

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 20%;
		bottom: 20%;
		width: 2px;
		border-radius: ${({ theme }) => theme.radii.pill};
		background: ${({ theme }) => theme.colors.main};
		opacity: ${({ $active }) => ($active ? 1 : 0)};
		box-shadow: ${({ $active, theme }) => ($active ? theme.shadows.glow : "none")};
		transition: opacity ${({ theme }) => theme.transitions.default};
	}

	&:hover {
		background: ${({ theme }) => theme.colors.input};
		color: ${({ theme }) => theme.colors.main} !important;
		text-decoration: none !important;
		opacity: 1 !important;
	}
`;

const NavIcon = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.25rem;
	font-size: 0.85rem;
	opacity: 0.9;
`;

const NavText = styled.span<{ $collapsed: boolean }>`
	white-space: nowrap;
	overflow: hidden;
	opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
	width: ${({ $collapsed }) => ($collapsed ? 0 : "auto")};
	transition: opacity ${({ theme }) => theme.transitions.default};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		opacity: 1;
		width: auto;
	}
`;

const BackLink = styled(NavLink)`
	margin-bottom: ${({ theme }) => theme.spacing.sm};
	color: ${({ theme }) => theme.colors.subtle} !important;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.04em;
	text-transform: uppercase;

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
	}
`;

const IssuerChip = styled.div<{ $collapsed: boolean }>`
	margin: 0 ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
	padding: ${({ theme }) => theme.spacing.sm};
	border-radius: ${({ theme }) => theme.radii.sm};
	background: ${({ theme }) => theme.colors.elevated};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	display: ${({ $collapsed }) => ($collapsed ? "none" : "flex")};
	flex-flow: column nowrap;
	gap: 0.2rem;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: flex;
	}
`;

const IssuerChipLabel = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
`;

const IssuerChipId = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.main};
	font-family: inherit;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const DrawerFooter = styled.div`
	margin-top: auto;
	padding: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
`;

const ExternalLink = styled.a<{ $collapsed: boolean }>`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.subtle} !important;
	text-decoration: none !important;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	white-space: nowrap;
	overflow: hidden;
	padding: ${({ theme }) => theme.spacing.xs} 0;
	opacity: 1 !important;
	transition: color ${({ theme }) => theme.transitions.default};

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
		text-decoration: none !important;
		opacity: 1 !important;
	}

	${({ $collapsed }) =>
		$collapsed &&
		`
		@media (min-width: 769px) {
			text-align: center;
			font-size: 0.6rem;
		}
	`}
`;

const SECTION_ICONS: Record<string, string> = {
	mint: "◆",
	manage: "☰",
	overview: "◎",
	stakeholders: "◎",
	"stock-classes": "▣",
	"issue-stock": "→",
	transactions: "≡",
};

export function LeftNavDrawer() {
	const router = useRouter();
	const { collapsed, mobileOpen, setMobileOpen } = useAppShell();
	const { pathname, query } = router;

	const isCapTableRoute = pathname === "/manage/cap-table";
	const issuerId = typeof query.issuerId === "string" ? query.issuerId : null;
	const currentView = parseCapTableView(query.view as string | undefined);

	const closeMobile = () => setMobileOpen(false);
	const showCollapsed = collapsed;

	const handleSectionNav = (view: CapTableView) => {
		if (!issuerId) return;
		router.push(capTableHref(issuerId, view));
		closeMobile();
	};

	return (
		<>
			<Overlay $open={mobileOpen} onClick={closeMobile} data-testid="nav-drawer-overlay" />
			<Drawer
				$collapsed={showCollapsed}
				$mobileOpen={mobileOpen}
				data-testid="left-nav-drawer"
				aria-label="Workspace navigation"
			>
				<DrawerInner>
					<BrandRow href="/" onClick={closeMobile} title="Back to site home">
						<BrandMark aria-hidden>TAP</BrandMark>
						<BrandText $collapsed={showCollapsed}>
							<BrandTitle>Transfer Agent</BrandTitle>
							<BrandSub>Protocol</BrandSub>
						</BrandText>
					</BrandRow>

					<NavSection>
						<NavLabel $collapsed={showCollapsed}>Workspace</NavLabel>
						{APP_NAV_ITEMS.map((item) => {
							// When inside a specific issuer, only "Cap Tables" parent is active
							// via match(); mint stays inactive.
							const active = item.match(pathname);
							return (
								<Link key={item.id} href={item.href} passHref legacyBehavior>
									<NavLink
										$active={active}
										$collapsed={showCollapsed}
										onClick={closeMobile}
										title={item.label}
										data-nav-id={item.id}
									>
										<NavIcon aria-hidden>{SECTION_ICONS[item.id] || "·"}</NavIcon>
										<NavText $collapsed={showCollapsed}>{item.label}</NavText>
									</NavLink>
								</Link>
							);
						})}
					</NavSection>

					{isCapTableRoute && issuerId && (
						<NavSection data-testid="cap-table-sections">
							<NavLabel $collapsed={showCollapsed}>This issuer</NavLabel>
							{!showCollapsed && (
								<Link href="/manage" passHref legacyBehavior>
									<BackLink onClick={closeMobile} $collapsed={showCollapsed}>
										← All cap tables
									</BackLink>
								</Link>
							)}
							<IssuerChip $collapsed={showCollapsed}>
								<IssuerChipLabel>Issuer</IssuerChipLabel>
								<IssuerChipId title={issuerId}>{issuerId}</IssuerChipId>
							</IssuerChip>
							{CAP_TABLE_SECTIONS.map((section) => {
								const active = currentView === section.id;
								return (
									<NavLink
										as="button"
										key={section.id}
										type="button"
										$active={active}
										$collapsed={showCollapsed}
										onClick={() => handleSectionNav(section.id)}
										title={section.description}
										data-nav-id={section.id}
										data-cap-section={section.id}
									>
										<NavIcon aria-hidden>{SECTION_ICONS[section.id] || "·"}</NavIcon>
										<NavText $collapsed={showCollapsed}>{section.label}</NavText>
									</NavLink>
								);
							})}
						</NavSection>
					)}

					<DrawerFooter>
						<ExternalLink
							href="https://docs.transferagentprotocol.xyz"
							target="_blank"
							rel="noopener noreferrer"
							$collapsed={showCollapsed}
						>
							{showCollapsed ? "Docs" : "Docs →"}
						</ExternalLink>
						<ExternalLink
							href="https://x.com/thatalexpalmer"
							target="_blank"
							rel="noopener noreferrer"
							$collapsed={showCollapsed}
						>
							{showCollapsed ? "X" : "@thatalexpalmer"}
						</ExternalLink>
						<ExternalLink
							href="https://github.com/transfer-agent-protocol/tap-cap-table"
							target="_blank"
							rel="noopener noreferrer"
							$collapsed={showCollapsed}
						>
							{showCollapsed ? "GH" : "Source →"}
						</ExternalLink>
					</DrawerFooter>
				</DrawerInner>
			</Drawer>
		</>
	);
}
