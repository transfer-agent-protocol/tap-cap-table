import { useCallback, useState } from "react";
import styled from "styled-components";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { Modal } from "../Modal";
import { Button, StatusMessage } from "../elements";
import { Mono, MutedText } from "../typography";
import { getExplorerUrl, productChainId, getChainName } from "../../config/wagmi";

const Body = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
`;

const AddressBlock = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
	padding: ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
`;

/** Full address always — never truncate (poisoning / lookalike risk). */
const FullAddress = styled(Mono)`
	display: block;
	word-break: break-all;
	font-size: ${({ theme }) => theme.fontSizes.small};
	color: ${({ theme }) => theme.colors.text};
	line-height: ${({ theme }) => theme.lineHeights.P};
	user-select: all;
`;

const ConnectedLabel = styled(MutedText)`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.06em;
	text-transform: uppercase;
`;

const Actions = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
`;

export interface AccountMenuProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AccountMenu({ isOpen, onClose }: AccountMenuProps) {
	const { address, chainId, isConnected } = useAccount();
	const { disconnect } = useDisconnect();
	const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();
	const [copied, setCopied] = useState(false);

	const wrongNetwork = Boolean(isConnected && chainId != null && chainId !== productChainId);
	const explorer = address ? getExplorerUrl(chainId ?? productChainId, address) : null;
	const productChainName = getChainName(productChainId);
	const currentNetworkName = chainId != null ? getChainName(chainId) : null;

	const handleCopy = useCallback(async () => {
		if (!address) return;
		try {
			await navigator.clipboard.writeText(address);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	}, [address]);

	const handleDisconnect = useCallback(() => {
		disconnect();
		onClose();
	}, [disconnect, onClose]);

	const handleSwitch = useCallback(() => {
		switchChain({ chainId: productChainId });
	}, [switchChain]);

	if (!address) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Account" maxWidth="28rem">
			<Body data-testid="wallet-account-menu">
				<AddressBlock>
					<ConnectedLabel>Connected:</ConnectedLabel>
					<FullAddress data-testid="wallet-full-address">{address}</FullAddress>
					{currentNetworkName && (
						<MutedText>
							Network: {currentNetworkName}
							{wrongNetwork ? " — switch to use the product" : ""}
						</MutedText>
					)}
				</AddressBlock>

				{wrongNetwork && (
					<StatusMessage $variant="pending">
						Switch to {productChainName} to use the product.
					</StatusMessage>
				)}

				{switchError && (
					<StatusMessage $variant="error">{switchError.message.slice(0, 200)}</StatusMessage>
				)}

				<Actions>
					<Button
						type="button"
						$variant={wrongNetwork ? "primary" : "secondary"}
						$block
						onClick={handleSwitch}
						disabled={isSwitching || (!wrongNetwork && chainId === productChainId)}
						data-testid="wallet-switch-network"
					>
						{isSwitching
							? "Switching…"
							: wrongNetwork
								? `Switch network to ${productChainName}`
								: `On ${productChainName}`}
					</Button>
					<Button type="button" $variant="secondary" $block onClick={handleCopy}>
						{copied ? "Copied" : "Copy address"}
					</Button>
					{explorer && (
						<Button
							type="button"
							$variant="secondary"
							$block
							onClick={() => window.open(explorer, "_blank", "noopener,noreferrer")}
						>
							View on explorer
						</Button>
					)}
					<Button
						type="button"
						$variant="danger"
						$block
						onClick={handleDisconnect}
						data-testid="wallet-disconnect"
					>
						Disconnect
					</Button>
				</Actions>
			</Body>
		</Modal>
	);
}
