import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../elements";
import { WalletModal } from "./WalletModal";
import { AccountMenu } from "./AccountMenu";
import { productChainId } from "../../config/wagmi";

/**
 * System wallet control — connect modal when disconnected, account menu when connected.
 * Never shows a truncated address (lookalike / poisoning risk). Full address lives in AccountMenu.
 * Mount with dynamic ssr:false from the shell so connectors never run on the server.
 */
export default function WalletButton() {
	const { address, isConnected, chainId } = useAccount();
	const [connectOpen, setConnectOpen] = useState(false);
	const [accountOpen, setAccountOpen] = useState(false);

	const wrongNetwork = Boolean(isConnected && chainId != null && chainId !== productChainId);

	const handleClick = useCallback(() => {
		if (isConnected && address) {
			setAccountOpen(true);
		} else {
			setConnectOpen(true);
		}
	}, [address, isConnected]);

	const label =
		isConnected && address ? (wrongNetwork ? "Wrong network" : "Connected") : "Connect Wallet";

	return (
		<>
			<Button
				$variant={wrongNetwork ? "secondary" : "primary"}
				type="button"
				onClick={handleClick}
				data-testid="wallet-connect-button"
				title={isConnected && address ? address : undefined}
			>
				{label}
			</Button>
			<WalletModal isOpen={connectOpen} onClose={() => setConnectOpen(false)} />
			<AccountMenu isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
		</>
	);
}
