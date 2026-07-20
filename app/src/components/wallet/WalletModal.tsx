import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { useConnect, useConnectors } from "wagmi";
import type { Connector } from "wagmi";
import { Modal } from "../Modal";
import { MutedText } from "../typography";
import { WalletOption } from "./WalletOption";
import { ConnectionError } from "./ConnectionError";
import { orderConnectors, isConnectorDetected } from "./orderConnectors";
import { getRecentConnectorId, setRecentConnectorId } from "./recentConnector";

const List = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
`;

const Empty = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
`;

const HelpLink = styled.a`
	font-family: ${({ theme }) => theme.fonts.sans};
	color: ${({ theme }) => theme.colors.accent} !important;
	font-size: ${({ theme }) => theme.fontSizes.small};
	text-decoration: none !important;

	&:hover {
		text-decoration: underline !important;
	}
`;

function connectorIcon(connector: Connector): string | null {
	const icon = connector.icon;
	return typeof icon === "string" && icon.length > 0 ? icon : null;
}

export interface WalletModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
	const connectors = useConnectors();
	const { connect, isPending, error, reset, variables } = useConnect();
	const [lastAttemptedId, setLastAttemptedId] = useState<string | null>(null);

	const recentId = useMemo(() => (isOpen ? getRecentConnectorId() : null), [isOpen]);

	const ordered = useMemo(() => {
		const mapped = connectors.map((c) => ({
			...c,
			detected: isConnectorDetected(c),
		}));
		return orderConnectors(mapped, recentId);
	}, [connectors, recentId]);

	const pendingConnector = variables?.connector;
	const pendingUid =
		isPending && pendingConnector && typeof pendingConnector === "object" && "uid" in pendingConnector
			? (pendingConnector as Connector).uid
			: null;

	const handleConnect = useCallback(
		(connector: Connector) => {
			setLastAttemptedId(connector.id);
			reset();
			connect(
				{ connector },
				{
					onSuccess: () => {
						setRecentConnectorId(connector.id);
						onClose();
					},
				},
			);
		},
		[connect, onClose, reset],
	);

	const handleRetry = useCallback(() => {
		const target =
			ordered.find((c) => c.id === lastAttemptedId) ||
			(pendingUid ? ordered.find((c) => c.uid === pendingUid) : undefined);
		if (target) handleConnect(target);
		else reset();
	}, [handleConnect, lastAttemptedId, ordered, pendingUid, reset]);

	const showError = Boolean(error && !isPending);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Connect wallet" maxWidth="400px">
			<div data-testid="wallet-modal">
				{showError && error && (
					<div style={{ marginBottom: "0.75rem" }}>
						<ConnectionError
							message={error.message}
							onRetry={handleRetry}
							onDismiss={() => reset()}
						/>
					</div>
				)}

				{ordered.length === 0 ? (
					<Empty>
						<MutedText>
							No wallet detected. Install a browser extension (Rabby, MetaMask, Zerion) and refresh this
							page.
						</MutedText>
						<HelpLink href="https://rabby.io" target="_blank" rel="noopener noreferrer">
							Get Rabby
						</HelpLink>
						<HelpLink href="https://metamask.io" target="_blank" rel="noopener noreferrer">
							Get MetaMask
						</HelpLink>
					</Empty>
				) : (
					<List>
						{ordered.map((connector) => (
							<WalletOption
								key={connector.uid}
								id={connector.id}
								name={connector.name}
								icon={connectorIcon(connector)}
								isRecent={recentId != null && (connector.id === recentId || connector.uid === recentId)}
								isDetected={Boolean(connector.detected)}
								isPending={pendingUid === connector.uid}
								disabled={isPending && pendingUid !== connector.uid}
								onClick={() => handleConnect(connector)}
							/>
						))}
					</List>
				)}

				{ordered.length > 0 && (
					<div style={{ marginTop: "1rem" }}>
						<MutedText>
							Your wallet becomes the admin of companies you create. We never hold your keys.
						</MutedText>
					</div>
				)}
			</div>
		</Modal>
	);
}
