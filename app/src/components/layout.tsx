import styled from "styled-components";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import { LeftNavDrawer } from "./LeftNavDrawer";
import { useAppShell } from "./AppShellContext";
import { FooterContent, FooterWrapper, Main, FullScreenMain } from "./wrappers";
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
	flex: 1;
	width: 100%;
	min-width: 0;
`;

export default function Layout({ children, className }: Props) {
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
			{workspace && <LeftNavDrawer />}
			<ShellMainColumn>
				<Navbar />
				<ContentArea>
					{workspace ? (
						<FullScreenMain data-testid="main-content">{children}</FullScreenMain>
					) : (
						<Main data-testid="main-content">{children}</Main>
					)}
				</ContentArea>
				<FooterWrapper>
					<FooterContent>
						<span>© {new Date().getFullYear()} PALMER.EARTH CORP</span>
					</FooterContent>
				</FooterWrapper>
			</ShellMainColumn>
		</ShellRoot>
	);
}
