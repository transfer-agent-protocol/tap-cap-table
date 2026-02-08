import styled from "styled-components";
import { Nav } from "./wrappers";
import { LogoRouter, StyledA } from "./buttons";
import Link from "next/link";
import Image from "next/image";

const NavActions = styled.span`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: 0.25rem;
`;

const WalletWrapper = styled.div`
	display: flex;
	align-items: center;
	padding-left: 1rem;
`;

export default function Navbar() {
	return (
		<Nav>
			<LogoRouter>
				<Link href="/">
					<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={48} height={48} />
				</Link>
			</LogoRouter>
			<NavActions>
				<StyledA>
					<Link href="https://docs.transferagentprotocol.xyz" target="_blank">Docs</Link>
				</StyledA>
				<StyledA>
					<Link href="https://github.com/transfer-agent-protocol/tap-cap-table" target="_blank">Github</Link>
				</StyledA>
				<WalletWrapper>
				{/* @ts-expect-error — Reown web component */}
					<appkit-button size="sm" />
				</WalletWrapper>
			</NavActions>
		</Nav>
	);
};
