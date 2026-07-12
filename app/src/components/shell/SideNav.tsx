import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppShell } from "./AppShellContext";
import {
	APP_NAV_ITEMS,
	CAP_TABLE_SECTIONS,
	capTableHref,
	isCompanyWorkspacePath,
	issuerIdFromPath,
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
	}
`;

const RAIL_WIDTH = "3rem";

const Drawer = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
	position: sticky;
	top: 0;
	align-self: flex-start;
	display: flex;
	flex-flow: column nowrap;
	width: ${({ theme, $collapsed }) => ($collapsed ? RAIL_WIDTH : theme.layout.navWidth)};
	min-width: ${({ theme, $collapsed }) => ($collapsed ? RAIL_WIDTH : theme.layout.navWidth)};
	height: 100vh;
	background: ${({ theme }) => theme.colors.background};
	border-right: 1px solid ${({ theme }) => theme.colors.border};
	overflow-x: hidden;
	overflow-y: auto;
	z-index: ${({ theme }) => theme.zIndices.dropdown};
	transition: width ${({ theme }) => theme.transitions.slow},
		min-width ${({ theme }) => theme.transitions.slow};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		position: fixed;
		left: 0;
		top: 0;
		width: ${({ theme }) => theme.layout.navWidth};
		min-width: ${({ theme }) => theme.layout.navWidth};
		transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? "0" : "-100%")});
		transition: transform ${({ theme }) => theme.transitions.default};
		box-shadow: ${({ $mobileOpen, theme }) => ($mobileOpen ? theme.shadows.overlay : "none")};
	}
`;

const DrawerInner = styled.div`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	padding: ${({ theme }) => theme.spacing.md} 0;
	min-height: 0;
`;

/** Collapse/expand control on the side nav edge (desktop only). */
const CollapseRow = styled.div<{ $collapsed: boolean }>`
	display: flex;
	flex-flow: row nowrap;
	justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-end")};
	padding: 0 ${({ theme }) => theme.spacing.sm};
	margin-bottom: ${({ theme }) => theme.spacing.lg};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: none;
	}
`;

const CollapseToggle = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	padding: 0;
	border: 1px solid ${({ theme }) => theme.colors.border};
	background: transparent;
	color: ${({ theme }) => theme.colors.textMuted};
	font-size: ${({ theme }) => theme.fontSizes.small};
	cursor: pointer;
	transition: border-color ${({ theme }) => theme.transitions.default},
		color ${({ theme }) => theme.transitions.default};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
		color: ${({ theme }) => theme.colors.text};
	}
`;

const NavSection = styled.div`
	display: flex;
	flex-flow: column nowrap;
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	padding: 0 ${({ theme }) => theme.spacing.sm};
	gap: 1px;
`;

const NavLabel = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	color: ${({ theme }) => theme.colors.textSubtle};
	white-space: nowrap;
`;

const NavLink = styled.a<{ $active?: boolean }>`
	display: block;
	width: 100%;
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
	border: none;
	border-left: 1px solid
		${({ $active, theme }) => ($active ? theme.colors.accent : "transparent")};
	background: ${({ $active, theme }) => ($active ? theme.colors.accentMuted : "transparent")};
	color: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.textMuted)} !important;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ $active, theme }) =>
		$active ? theme.fontWeights.semibold : theme.fontWeights.normal};
	font-family: inherit;
	text-align: left;
	text-decoration: none !important;
	white-space: nowrap;
	cursor: pointer;
	transition: background ${({ theme }) => theme.transitions.default},
		color ${({ theme }) => theme.transitions.default},
		border-color ${({ theme }) => theme.transitions.default};

	&:hover {
		background: ${({ theme }) => theme.colors.elevated};
		color: ${({ theme }) => theme.colors.text} !important;
		text-decoration: none !important;
	}
`;

const BackLink = styled(NavLink)`
	color: ${({ theme }) => theme.colors.textSubtle} !important;
	margin-bottom: ${({ theme }) => theme.spacing.sm};

	&:hover {
		color: ${({ theme }) => theme.colors.text} !important;
	}
`;

const DrawerFooter = styled.div`
	margin-top: auto;
	padding: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
`;

const ExternalLink = styled.a`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.textSubtle} !important;
	text-decoration: none !important;
	letter-spacing: 0.04em;
	white-space: nowrap;

	&:hover {
		color: ${({ theme }) => theme.colors.text} !important;
		text-decoration: none !important;
	}
`;

/**
 * Side nav — the working navigation.
 * App destinations, company sections when inside a company, and doc links.
 * Collapses to a slim rail on desktop; overlay drawer on mobile.
 */
export function SideNav() {
	const router = useRouter();
	const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useAppShell();
	const { pathname, query, asPath } = router;

	// router.pathname is the *pattern* (e.g. /app/companies/[issuerId]) — never use it
	// for the real UUID. Prefer query.issuerId, then asPath.
	const issuerId =
		typeof query.issuerId === "string" &&
		query.issuerId.length > 0 &&
		query.issuerId !== "[issuerId]"
			? query.issuerId
			: issuerIdFromPath(asPath.split("?")[0] || "");

	const isCapTableRoute =
		Boolean(issuerId) &&
		(isCompanyWorkspacePath(asPath.split("?")[0] || "") ||
			pathname.startsWith("/app/companies/"));
	const currentView = parseCapTableView(query.view as string | undefined);

	const closeMobile = () => setMobileOpen(false);

	const handleSectionNav = (view: CapTableView) => {
		if (!issuerId || issuerId === "[issuerId]") {
			console.error("[nav] refusing section nav without real issuer id", { issuerId, asPath });
			return;
		}
		router.push(capTableHref(issuerId, view));
		closeMobile();
	};

	return (
		<>
			<Overlay $open={mobileOpen} onClick={closeMobile} data-testid="nav-drawer-overlay" />
			<Drawer
				$collapsed={collapsed}
				$mobileOpen={mobileOpen}
				data-testid="left-nav-drawer"
				aria-label="Workspace navigation"
			>
				<DrawerInner>
					<CollapseRow $collapsed={collapsed}>
						<CollapseToggle
							type="button"
							onClick={toggleCollapsed}
							aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
							title={collapsed ? "Expand navigation" : "Collapse navigation"}
							data-testid="nav-collapse-toggle"
						>
							{collapsed ? "»" : "«"}
						</CollapseToggle>
					</CollapseRow>

					{!collapsed && (
						<>
							<NavSection>
								<NavLabel>Workspace</NavLabel>
								{APP_NAV_ITEMS.map((item) => {
									const active = item.match(pathname);
									return (
										<NavLink
											key={item.id}
											as={Link}
											href={item.href}
											$active={active}
											onClick={closeMobile}
											data-nav-id={item.id}
										>
											{item.label}
										</NavLink>
									);
								})}
							</NavSection>

							{isCapTableRoute && issuerId && (
								<NavSection data-testid="cap-table-sections">
									<BackLink as={Link} href="/app/companies" onClick={closeMobile}>
										← Companies
									</BackLink>
									<NavLabel>Company</NavLabel>
									{CAP_TABLE_SECTIONS.map((section) => {
										const active = currentView === section.id;
										return (
											<NavLink
												as="button"
												key={section.id}
												type="button"
												$active={active}
												onClick={() => handleSectionNav(section.id)}
												data-nav-id={section.id}
												data-cap-section={section.id}
											>
												{section.label}
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
								>
									Docs
								</ExternalLink>
								<ExternalLink
									href="https://github.com/transfer-agent-protocol/tap-cap-table"
									target="_blank"
									rel="noopener noreferrer"
								>
									GitHub
								</ExternalLink>
							</DrawerFooter>
						</>
					)}
				</DrawerInner>
			</Drawer>
		</>
	);
}
