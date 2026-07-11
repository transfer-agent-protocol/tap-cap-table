import styled from "styled-components";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import { LeftNavDrawer } from "./LeftNavDrawer";
import { useAppShell } from "./AppShellContext";
import { FooterContent, FooterWrapper, Main, FullScreenMain } from "./wrappers";

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
	background:
		radial-gradient(1200px 600px at 10% -10%, rgba(200, 245, 66, 0.07), transparent 55%),
		radial-gradient(900px 500px at 100% 0%, rgba(125, 211, 252, 0.05), transparent 50%),
		${({ theme }) => theme.colors.background};
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

/**
 * App shell: left collapsible page nav + top account/wallet bar + main content.
 */
export default function Layout({ children, className }: Props) {
	const { pathname } = useRouter();
	const { collapsed } = useAppShell();
	const isAppFullScreen =
		pathname === "/mint" || pathname === "/manage" || pathname.startsWith("/manage/");

	return (
		<ShellRoot className={className} data-testid="app-shell" data-nav-collapsed={collapsed ? "1" : "0"}>
			<LeftNavDrawer />
			<ShellMainColumn>
				<Navbar />
				<ContentArea>
					{isAppFullScreen ? (
						<FullScreenMain data-testid="main-content">{children}</FullScreenMain>
					) : (
						<Main data-testid="main-content">{children}</Main>
					)}
				</ContentArea>
				<FooterWrapper>
					<FooterContent>
						<span>© {new Date().getFullYear()} Transfer Agent Protocol</span>
						<span>Open Cap Table · Onchain</span>
					</FooterContent>
				</FooterWrapper>
			</ShellMainColumn>
		</ShellRoot>
	);
}
