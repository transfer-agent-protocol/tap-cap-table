import dynamic from "next/dynamic";
import { Button, StatusMessage, ResponseBlock } from "../../elements";
import { MutedText } from "../../typography";
import { Field, FieldLabel } from "../../forms";
import type { IssuerResponse } from "../../../services/registerIssuer";

const WalletButton = dynamic(() => import("../../shell/WalletButtonClient"), {
	ssr: false,
	loading: () => <Button $variant="primary">Connect Wallet</Button>,
});

export interface MintActionsProps {
	isConnected: boolean;
	canMint: boolean;
	isWritePending: boolean;
	isConfirming: boolean;
	isRegistering: boolean;
	isConfirmed: boolean;
	txHash: `0x${string}` | undefined;
	deployedAddress: string | null;
	writeError: string | null;
	serverError: string | null;
	result: IssuerResponse | null;
	onMint: () => void;
}

export function MintActions({
	isConnected,
	canMint,
	isWritePending,
	isConfirming,
	isRegistering,
	isConfirmed,
	txHash,
	deployedAddress,
	writeError,
	serverError,
	result,
	onMint,
}: MintActionsProps) {
	if (!isConnected) {
		return (
			<>
				<StatusMessage $variant="pending">
					Connect your wallet to create a cap table. That wallet becomes the admin.
				</StatusMessage>
				<div style={{ marginTop: "0.75rem" }}>
					<WalletButton />
				</div>
			</>
		);
	}

	return (
		<>
			<Button $variant="primary" $size="lg" $block onClick={onMint} disabled={!canMint} type="button">
				{isWritePending
					? "Confirm in wallet…"
					: isConfirming
						? "Confirming…"
						: isRegistering
							? "Finishing up…"
							: "Create company"}
			</Button>

			<MutedText>
				You&apos;ll sign one transaction. When it confirms, the company is ready.
			</MutedText>

			{writeError && (
				<StatusMessage $variant="error">
					{writeError.includes("User rejected") || writeError.includes("denied")
						? "You rejected the transaction."
						: writeError.slice(0, 300)}
				</StatusMessage>
			)}

			{serverError && (
				<StatusMessage $variant="error">
					The chain deploy may have worked, but saving company details failed: {serverError.slice(0, 300)}
				</StatusMessage>
			)}

			{txHash && !isConfirmed && (
				<StatusMessage $variant="pending">Transaction submitted: {txHash}</StatusMessage>
			)}

			{isConfirmed && deployedAddress && !result && !serverError && (
				<StatusMessage $variant="pending">
					Deployed at {deployedAddress}. Saving company details...
				</StatusMessage>
			)}

			{result && (
				<>
					<StatusMessage $variant="success">Cap table created.</StatusMessage>
					<Field>
						<FieldLabel>Issuer ID</FieldLabel>
						<ResponseBlock>{result._id}</ResponseBlock>
					</Field>
					<Field>
						<FieldLabel>Contract</FieldLabel>
						<ResponseBlock>{result.deployed_to}</ResponseBlock>
					</Field>
					<Field>
						<FieldLabel>Transaction</FieldLabel>
						<ResponseBlock>{result.tx_hash}</ResponseBlock>
					</Field>
				</>
			)}
		</>
	);
}
