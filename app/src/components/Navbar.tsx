import styled from "styled-components";
import dynamic from "next/dynamic";
import { Nav } from "./wrappers";
import { LogoRouter, StyledA, WalletButtonStyled } from "./buttons";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const NavActions = styled.span`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: 0.25rem;
`;

// Client-only: useAppKit requires createAppKit to have been called (client-side only)
const WalletButton = dynamic(() => import("./WalletButtonClient"), {
	ssr: false,
	loading: () => <WalletButtonStyled>Connect Wallet</WalletButtonStyled>,
});

export default function Navbar() {
	const { pathname } = useRouter();
	const showWallet = pathname === "/mint";

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
				{showWallet && <WalletButton />}
			</NavActions>
		</Nav>
	);
}
