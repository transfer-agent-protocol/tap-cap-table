import styled from "styled-components";
import { Button, StatusMessage } from "../elements";

const Wrap = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	font-family: ${({ theme }) => theme.fonts.sans};
`;

const Actions = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing.sm};
`;

function humanizeConnectError(message: string): string {
	const m = message || "";
	if (/user rejected|denied|rejected the request/i.test(m)) {
		return "You rejected the connection request.";
	}
	if (/provider not found|no provider/i.test(m)) {
		return "No wallet provider found. Install a browser extension wallet and try again.";
	}
	return m.slice(0, 280) || "Could not connect to wallet.";
}

export interface ConnectionErrorProps {
	message: string;
	onRetry: () => void;
	onDismiss: () => void;
}

export function ConnectionError({ message, onRetry, onDismiss }: ConnectionErrorProps) {
	return (
		<Wrap data-testid="wallet-connection-error">
			<StatusMessage $variant="error">{humanizeConnectError(message)}</StatusMessage>
			<Actions>
				<Button type="button" $variant="ghost" onClick={onDismiss}>
					Dismiss
				</Button>
				<Button type="button" $variant="secondary" onClick={onRetry}>
					Try again
				</Button>
			</Actions>
		</Wrap>
	);
}
