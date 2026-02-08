import styled from "styled-components";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

const Button = styled.button`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	background: ${({ theme }) => theme.colors.main};
	height: 2.25rem;
	padding: 0 1rem;
	margin-left: 1rem;
	border: none;
	border-radius: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: bold;
	font-family: inherit;
	color: ${({ theme }) => theme.colors.background};
	cursor: pointer;
	transition: opacity 0.168s cubic-bezier(0.211, 0.69, 0.313, 1);
	white-space: nowrap;

	&:hover {
		opacity: 0.85;
	}
`;

function truncateAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletButton() {
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();

	return (
		<Button onClick={() => open()}>
			{isConnected && address ? truncateAddress(address) : "Connect Wallet"}
		</Button>
	);
}
