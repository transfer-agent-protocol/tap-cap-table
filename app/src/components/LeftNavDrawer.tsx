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
	}
`;

const Drawer = styled.aside<{ $collapsed: boolean; $mobileOpen: boolean }>`
	position: sticky;
	top: 0;
	align-self: flex-start;
	display: ${({ $collapsed }) => ($collapsed ? "none" : "flex")};
	flex-flow: column nowrap;
	width: ${({ theme }) => theme.layout.navWidth};
	min-width: ${({ theme }) => theme.layout.navWidth};
	height: 100vh;
	background: ${({ theme }) => theme.colors.surface};
	border-right: 1px solid ${({ theme }) => theme.colors.outline};
	box-sizing: border-box;
	overflow-x: hidden;
	overflow-y: auto;
	z-index: ${({ theme }) => theme.zIndices.dropdown};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: flex;
		position: fixed;
		left: 0;
		top: 0;
		transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? "0" : "-100%")});
		transition: transform ${({ theme }) => theme.transitions.default};
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
	align-items: center;
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text} !important;
	text-decoration: none !important;
	opacity: 1 !important;

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
		text-decoration: none !important;
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
	color: ${({ theme }) => theme.colors.subtle};
`;

const NavLink = styled.a<{ $active?: boolean }>`
	display: block;
	width: 100%;
	padding: 0.55rem ${({ theme }) => theme.spacing.sm};
	border: none;
	border-left: 1px solid
		${({ $active, theme }) => ($active ? theme.colors.main : "transparent")};
	background: ${({ $active, theme }) => ($active ? theme.colors.accentMuted : "transparent")};
	color: ${({ $active, theme }) => ($active ? theme.colors.main : theme.colors.muted)} !important;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ $active, theme }) =>
		$active ? theme.fontWeights.semibold : theme.fontWeights.normal};
	font-family: inherit;
	text-align: left;
	text-decoration: none !important;
	opacity: 1 !important;
	cursor: pointer;
	box-sizing: border-box;
	transition: background ${({ theme }) => theme.transitions.default},
		color ${({ theme }) => theme.transitions.default},
		border-color ${({ theme }) => theme.transitions.default};

	&:hover {
		background: ${({ theme }) => theme.colors.elevated};
		color: ${({ theme }) => theme.colors.text} !important;
		text-decoration: none !important;
	}
`;

const IssuerId = styled.div`
	margin: 0 ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
	padding: 0;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	line-height: 1.4;
	color: ${({ theme }) => theme.colors.subtle};
	word-break: break-all;
	user-select: all;
`;

const BackLink = styled(NavLink)`
	color: ${({ theme }) => theme.colors.subtle} !important;
	margin-bottom: ${({ theme }) => theme.spacing.xs};

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
	}
`;

const DrawerFooter = styled.div`
	margin-top: auto;
	padding: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
`;

const ExternalLink = styled.a`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.subtle} !important;
	text-decoration: none !important;
	letter-spacing: 0.04em;
	opacity: 1 !important;

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
		text-decoration: none !important;
	}
`;

export function LeftNavDrawer() {
	const router = useRouter();
	const { collapsed, mobileOpen, setMobileOpen } = useAppShell();
	const { pathname, query } = router;

	const isCapTableRoute = pathname === "/manage/cap-table";
	const issuerId = typeof query.issuerId === "string" ? query.issuerId : null;
	const currentView = parseCapTableView(query.view as string | undefined);

	const closeMobile = () => setMobileOpen(false);

	const handleSectionNav = (view: CapTableView) => {
		if (!issuerId) return;
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
					<BrandRow href="/" onClick={closeMobile}>
						TAP
					</BrandRow>

					<NavSection>
						<NavLabel>App</NavLabel>
						{APP_NAV_ITEMS.map((item) => {
							const active = item.match(pathname);
							return (
								<Link key={item.id} href={item.href} passHref legacyBehavior>
									<NavLink
										$active={active}
										onClick={closeMobile}
										data-nav-id={item.id}
									>
										{item.label}
									</NavLink>
								</Link>
							);
						})}
					</NavSection>

					{isCapTableRoute && issuerId && (
						<NavSection data-testid="cap-table-sections">
							<NavLabel>This company</NavLabel>
							<Link href="/manage" passHref legacyBehavior>
								<BackLink onClick={closeMobile}>All companies</BackLink>
							</Link>
							<IssuerId title={issuerId}>{issuerId}</IssuerId>
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
				</DrawerInner>
			</Drawer>
		</>
	);
}
