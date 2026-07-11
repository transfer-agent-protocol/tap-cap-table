import dynamic from "next/dynamic";
import { MintButton, WalletButtonStyled } from "./buttons";
import { StatusBox, ResponseBlock, MutedText } from "./wrappers";
import { FieldGroup, FieldLabel } from "./forms";
import type { IssuerResponse } from "../services/registerIssuer";

const WalletButton = dynamic(() => import("./WalletButtonClient"), {
	ssr: false,
	loading: () => <WalletButtonStyled>Connect Wallet</WalletButtonStyled>,
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
				<StatusBox $variant="pending">
					Connect your wallet to create a cap table. That wallet becomes the admin.
				</StatusBox>
				<div style={{ marginTop: "0.75rem" }}>
					<WalletButton />
				</div>
			</>
		);
	}

	return (
		<>
			<MintButton onClick={onMint} disabled={!canMint} type="button">
				{isWritePending
					? "Confirm in wallet..."
					: isConfirming
						? "Confirming..."
						: isRegistering
							? "Finishing up..."
							: "Mint Cap Table"}
			</MintButton>

			<MutedText>
				You&apos;ll sign one transaction. When it confirms, the company is ready to manage.
			</MutedText>

			{writeError && (
				<StatusBox $variant="error">
					{writeError.includes("User rejected") || writeError.includes("denied")
						? "You rejected the transaction."
						: writeError.slice(0, 300)}
				</StatusBox>
			)}

			{serverError && (
				<StatusBox $variant="error">
					The chain deploy may have worked, but saving company details failed: {serverError.slice(0, 300)}
				</StatusBox>
			)}

			{txHash && !isConfirmed && (
				<StatusBox $variant="pending">Transaction submitted: {txHash}</StatusBox>
			)}

			{isConfirmed && deployedAddress && !result && !serverError && (
				<StatusBox $variant="pending">
					Deployed at {deployedAddress}. Saving company details...
				</StatusBox>
			)}

			{result && (
				<>
					<StatusBox $variant="success">Cap table created.</StatusBox>
					<FieldGroup>
						<FieldLabel>Issuer ID</FieldLabel>
						<ResponseBlock>{result._id}</ResponseBlock>
					</FieldGroup>
					<FieldGroup>
						<FieldLabel>Contract</FieldLabel>
						<ResponseBlock>{result.deployed_to}</ResponseBlock>
					</FieldGroup>
					<FieldGroup>
						<FieldLabel>Transaction</FieldLabel>
						<ResponseBlock>{result.tx_hash}</ResponseBlock>
					</FieldGroup>
				</>
			)}
		</>
	);
}
