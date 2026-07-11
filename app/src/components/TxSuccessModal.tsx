import styled from "styled-components";
import { Modal } from "./Modal";
import { InlineButton } from "./buttons";
import { ResponseBlock } from "./wrappers";

interface TxSuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	txHash?: string;
	message?: string;
	/** error | info | success — controls default body when no message/hash */
	variant?: "success" | "error" | "info";
}

const Stack = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.p`
	margin: 0;
	color: ${({ theme }) => theme.colors.muted};
	font-size: ${({ theme }) => theme.fontSizes.small};
	line-height: 1.55;
`;

const Label = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Actions = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-top: ${({ theme }) => theme.spacing.xs};
`;

export function TxSuccessModal({
	isOpen,
	onClose,
	title,
	txHash,
	message,
	variant = "success",
}: TxSuccessModalProps) {
	const explorerUrl = txHash ? `https://explorer.plume.org/tx/${txHash}` : undefined;

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<Stack>
				{message && <Message>{message}</Message>}

				{txHash ? (
					<div>
						<Label>Transaction</Label>
						<ResponseBlock>{txHash}</ResponseBlock>
						{explorerUrl && (
							<Actions style={{ justifyContent: "flex-start", marginTop: "0.75rem" }}>
								<InlineButton
									as="a"
									href={explorerUrl}
									target="_blank"
									rel="noopener noreferrer"
									$variant="primary"
								>
									View on explorer
								</InlineButton>
							</Actions>
						)}
					</div>
				) : (
					// Never imply a tx was submitted for pure validation / error modals
					!message &&
					variant === "success" && (
						<Message>Waiting for wallet confirmation…</Message>
					)
				)}

				<Actions>
					<InlineButton onClick={onClose} $variant="secondary" type="button">
						Close
					</InlineButton>
				</Actions>
			</Stack>
		</Modal>
	);
}
