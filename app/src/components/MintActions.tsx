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
					Connect the admin wallet to deploy a new issuer onchain. The same wallet will own ADMIN on the
					cap table.
				</StatusBox>
				<div style={{ marginTop: "0.75rem" }}>
					<WalletButton />
				</div>
				<MutedText style={{ marginTop: "0.75rem" }}>
					Use the top-right Connect Wallet control anytime — it stays in sync with this flow.
				</MutedText>
			</>
		);
	}

	return (
		<>
			<MintButton onClick={onMint} disabled={!canMint} type="button">
				{isWritePending
					? "Confirm in wallet..."
					: isConfirming
						? "Confirming onchain..."
						: isRegistering
							? "Saving metadata..."
							: "Mint Cap Table"}
			</MintButton>

			<MutedText>
				Onchain: factory deploys CapTable. Offchain: API stores OCF issuer metadata after the receipt.
			</MutedText>

			{writeError && (
				<StatusBox $variant="error">
					{writeError.includes("User rejected") || writeError.includes("denied")
						? "Transaction rejected."
						: writeError.slice(0, 300)}
				</StatusBox>
			)}

			{serverError && (
				<StatusBox $variant="error">
					Onchain deploy may have succeeded, but metadata registration failed: {serverError.slice(0, 300)}
				</StatusBox>
			)}

			{txHash && !isConfirmed && (
				<StatusBox $variant="pending">Transaction submitted: {txHash}</StatusBox>
			)}

			{isConfirmed && deployedAddress && !result && !serverError && (
				<StatusBox $variant="pending">
					Cap table at {deployedAddress}. Registering issuer metadata...
				</StatusBox>
			)}

			{result && (
				<>
					<StatusBox $variant="success">Cap table deployed and registered.</StatusBox>
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
