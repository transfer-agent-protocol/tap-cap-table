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

const DRAWER_WIDTH = "15.5rem";
const DRAWER_COLLAPSED_WIDTH = "3.75rem";

const Overlay = styled.div<{ $open: boolean }>`
	display: none;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: block;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
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
	display: flex;
	flex-flow: column nowrap;
	width: ${({ $collapsed }) => ($collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH)};
	min-width: ${({ $collapsed }) => ($collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH)};
	height: 100vh;
	background: ${({ theme }) => theme.colors.background};
	border-right: 1px solid ${({ theme }) => theme.colors.outline};
	box-sizing: border-box;
	overflow-x: hidden;
	overflow-y: auto;
	transition: width ${({ theme }) => theme.transitions.default},
		min-width ${({ theme }) => theme.transitions.default},
		transform ${({ theme }) => theme.transitions.default};
	z-index: ${({ theme }) => theme.zIndices.dropdown};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		position: fixed;
		left: 0;
		top: 0;
		width: ${DRAWER_WIDTH};
		min-width: ${DRAWER_WIDTH};
		transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? "0" : "-100%")});
		box-shadow: ${({ $mobileOpen }) => ($mobileOpen ? "4px 0 20px rgba(0,0,0,0.12)" : "none")};
	}
`;

const DrawerInner = styled.div`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	padding: ${({ theme }) => theme.spacing.md} 0;
	min-height: 0;
`;

const BrandRow = styled.div<{ $collapsed: boolean }>`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	padding: 0 ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	min-height: 2.5rem;
`;

const BrandText = styled.span<{ $collapsed: boolean }>`
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
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

const NavSection = styled.div`
	display: flex;
	flex-flow: column nowrap;
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NavLabel = styled.div<{ $collapsed: boolean }>`
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	text-transform: uppercase;
	letter-spacing: 0.05em;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
	opacity: ${({ $collapsed }) => ($collapsed ? 0 : 0.55)};
	height: ${({ $collapsed }) => ($collapsed ? 0 : "auto")};
	overflow: hidden;
	white-space: nowrap;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		opacity: 0.55;
		height: auto;
	}
`;

const NavLink = styled.a<{ $active?: boolean; $collapsed?: boolean }>`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	padding: ${({ theme }) => theme.spacing.sm}
		${({ theme, $collapsed }) => ($collapsed ? theme.spacing.sm : theme.spacing.md)};
	margin: 0 ${({ theme }) => theme.spacing.xs};
	border-radius: ${({ theme }) => theme.radii.sm};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ $active, theme }) =>
		$active ? theme.fontWeights.semibold : theme.fontWeights.normal};
	background: ${({ $active, theme }) => ($active ? theme.colors.input : "transparent")};
	color: ${({ theme }) => theme.colors.text};
	text-decoration: none;
	cursor: pointer;
	border: none;
	width: calc(100% - ${({ theme }) => theme.spacing.sm});
	box-sizing: border-box;
	text-align: left;
	transition: background ${({ theme }) => theme.transitions.default};

	&:hover {
		background: ${({ theme }) => theme.colors.input};
	}
`;

const NavIcon = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.25rem;
	font-size: ${({ theme }) => theme.fontSizes.small};
	opacity: 0.85;
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

const DrawerFooter = styled.div<{ $collapsed: boolean }>`
	margin-top: auto;
	padding: ${({ theme }) => theme.spacing.md};
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
`;

const ExternalLink = styled.a<{ $collapsed: boolean }>`
	font-size: ${({ theme }) => theme.fontSizes.small};
	color: ${({ theme }) => theme.colors.text};
	opacity: 0.7;
	text-decoration: none;
	white-space: nowrap;
	overflow: hidden;

	&:hover {
		opacity: 1;
	}

	${({ $collapsed }) =>
		$collapsed &&
		`
		@media (min-width: 769px) {
			font-size: 0.65rem;
			text-align: center;
		}
	`}
`;

const SECTION_ICONS: Record<string, string> = {
	home: "⌂",
	mint: "＋",
	manage: "☰",
	overview: "◎",
	stakeholders: "◎",
	"stock-classes": "▣",
	"issue-stock": "⇢",
	transactions: "↕",
	docs: "?",
	github: "⟨/⟩",
};

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
		const href = capTableHref(issuerId, view);
		router.push(href);
		closeMobile();
	};

	// On desktop collapse is controlled by shell; on mobile always show labels.
	const showCollapsed = collapsed;

	return (
		<>
			<Overlay $open={mobileOpen} onClick={closeMobile} data-testid="nav-drawer-overlay" />
			<Drawer
				$collapsed={showCollapsed}
				$mobileOpen={mobileOpen}
				data-testid="left-nav-drawer"
				aria-label="Primary navigation"
			>
				<DrawerInner>
					<BrandRow $collapsed={showCollapsed}>
						<NavIcon aria-hidden>TAP</NavIcon>
						<BrandText $collapsed={showCollapsed}>Cap Table</BrandText>
					</BrandRow>

					<NavSection>
						<NavLabel $collapsed={showCollapsed}>App</NavLabel>
						{APP_NAV_ITEMS.map((item) => {
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
							<NavLabel $collapsed={showCollapsed}>Cap Table</NavLabel>
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

					<DrawerFooter $collapsed={showCollapsed}>
						<ExternalLink
							href="https://docs.transferagentprotocol.xyz"
							target="_blank"
							rel="noopener noreferrer"
							$collapsed={showCollapsed}
						>
							{showCollapsed ? "Docs" : "Documentation"}
						</ExternalLink>
						<ExternalLink
							href="https://github.com/transfer-agent-protocol/tap-cap-table"
							target="_blank"
							rel="noopener noreferrer"
							$collapsed={showCollapsed}
						>
							{showCollapsed ? "GH" : "Github"}
						</ExternalLink>
					</DrawerFooter>
				</DrawerInner>
			</Drawer>
		</>
	);
}

export const LEFT_NAV_DRAWER_WIDTH = DRAWER_WIDTH;
export const LEFT_NAV_DRAWER_COLLAPSED_WIDTH = DRAWER_COLLAPSED_WIDTH;
