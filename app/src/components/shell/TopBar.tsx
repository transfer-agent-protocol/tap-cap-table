import styled from "styled-components";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Button } from "../elements";
import { useAppShell } from "./AppShellContext";
import { isWorkspaceRoute } from "./navConfig";

const Bar = styled.nav`
	position: sticky;
	top: 0;
	z-index: ${({ theme }) => theme.zIndices.sticky};
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	min-height: ${({ theme }) => theme.layout.topBar};
	padding: 0 ${({ theme }) => theme.spacing.xl};
	background: rgba(10, 10, 10, 0.85);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: 0 ${({ theme }) => theme.spacing.lg};
	}
`;

const Brand = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	min-width: 0;

	a {
		display: inline-flex;
		line-height: 0;
	}
`;

/** System area — wallet/account now; sign-in and security settings later. */
const SystemActions = styled.span`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-left: auto;
`;

/** Mobile-only drawer toggle; desktop collapse lives on the side nav edge. */
const MobileMenuToggle = styled.button`
	display: none;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		display: inline-flex;
		flex-flow: column nowrap;
		align-items: center;
		justify-content: center;
		gap: ${({ theme }) => theme.spacing.xs};
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 1px solid ${({ theme }) => theme.colors.border};
		background: transparent;
		cursor: pointer;
		transition: border-color ${({ theme }) => theme.transitions.default};

		span {
			display: block;
			width: 12px;
			height: 1px;
			background: ${({ theme }) => theme.colors.textMuted};
		}

		&:hover {
			border-color: ${({ theme }) => theme.colors.borderStrong};
		}
	}
`;

const ExternalLink = styled.a`
	display: inline-flex;
	align-items: center;
	height: 2.25rem;
	padding: 0 ${({ theme }) => theme.spacing.sm};
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	color: ${({ theme }) => theme.colors.textMuted} !important;
	text-decoration: none !important;
	transition: color ${({ theme }) => theme.transitions.default};

	&:hover {
		color: ${({ theme }) => theme.colors.text} !important;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.phone}) {
		display: none;
	}
`;

const WalletButton = dynamic(() => import("./WalletButtonClient"), {
	ssr: false,
	loading: () => <Button $variant="primary">Connect</Button>,
});

/**
 * Top bar — system chrome only.
 * Marketing (`/`): brand + Docs/GitHub.
 * Product (`/app/*`): brand + wallet (and future account/security actions).
 * Working navigation lives in the side nav; page identity in PageHeader.
 */
export default function TopBar() {
	const { pathname } = useRouter();
	const { mobileOpen, toggleMobileOpen, setMobileOpen } = useAppShell();
	const workspace = isWorkspaceRoute(pathname);

	return (
		<Bar data-testid="top-nav" role="banner">
			<Brand>
				{workspace && (
					<MobileMenuToggle
						type="button"
						onClick={toggleMobileOpen}
						aria-label={mobileOpen ? "Close menu" : "Open menu"}
						data-testid="mobile-nav-toggle"
					>
						<span />
						<span />
						<span />
					</MobileMenuToggle>
				)}
				<Link href="/" aria-label="Home" onClick={() => setMobileOpen(false)}>
					<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={32} height={32} />
				</Link>
			</Brand>
			<SystemActions data-testid="top-nav-account">
				{!workspace && (
					<>
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
					</>
				)}
				{workspace && <WalletButton />}
			</SystemActions>
		</Bar>
	);
}
