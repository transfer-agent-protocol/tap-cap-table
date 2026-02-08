import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { WalletButtonStyled } from "./buttons";

function truncateAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletButtonClient() {
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();

	return (
		<WalletButtonStyled onClick={() => open()}>
			{isConnected && address ? truncateAddress(address) : "Connect Wallet"}
		</WalletButtonStyled>
	);
}
