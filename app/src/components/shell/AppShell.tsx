import styled from "styled-components";
import { useRouter } from "next/router";
import TopBar from "./TopBar";
import { SideNav } from "./SideNav";
import { useAppShell } from "./AppShellContext";
import { isWorkspaceRoute } from "./navConfig";

interface Props {
	children: React.ReactNode;
	className?: string;
}

const ShellRoot = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: stretch;
	width: 100%;
	min-height: 100vh;
	background: ${({ theme }) => theme.colors.background};
	font-family: ${({ theme }) => theme.fonts.sans};
`;

const ShellMainColumn = styled.div`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	min-width: 0;
	align-items: stretch;
`;

const ContentArea = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
	flex: 1;
	width: 100%;
	min-width: 0;
`;

const Footer = styled.footer`
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	flex-shrink: 0;
	width: 100%;
	margin-top: auto;
	padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.textSubtle};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
	}
`;

/**
 * App shell.
 * Side nav (working navigation) on workspace routes; top bar (system) everywhere.
 */
export default function AppShell({ children, className }: Props) {
	const { pathname } = useRouter();
	const { collapsed } = useAppShell();
	const workspace = isWorkspaceRoute(pathname);

	return (
		<ShellRoot
			className={className}
			data-testid="app-shell"
			data-nav-collapsed={collapsed ? "1" : "0"}
			data-workspace={workspace ? "1" : "0"}
		>
			{workspace && <SideNav />}
			<ShellMainColumn>
				<TopBar />
				<ContentArea data-testid="main-content">{children}</ContentArea>
				<Footer>
					<span>© {new Date().getFullYear()} PALMER.EARTH CORP</span>
				</Footer>
			</ShellMainColumn>
		</ShellRoot>
	);
}
