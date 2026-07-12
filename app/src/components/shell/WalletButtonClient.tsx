import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "../elements";
import { Mono } from "../typography";

function truncateAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletButtonClient() {
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();

	return (
		<Button $variant="primary" onClick={() => open()}>
			{isConnected && address ? <Mono>{truncateAddress(address)}</Mono> : "Connect Wallet"}
		</Button>
	);
}
