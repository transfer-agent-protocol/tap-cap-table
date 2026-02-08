import { MintButton } from "./buttons";
import { StatusBox, ResponseBlock } from "./wrappers";
import { FieldGroup, FieldLabel } from "./forms";
import type { IssuerResponse } from "../services/registerIssuer";

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
			<StatusBox $variant="pending">
				Connect your wallet to mint a cap table.
			</StatusBox>
		);
	}

	return (
		<>
			<MintButton onClick={onMint} disabled={!canMint}>
				{isWritePending
					? "Confirm in wallet..."
					: isConfirming
						? "Confirming onchain..."
						: isRegistering
							? "Registering with server..."
							: "Mint Cap Table"}
			</MintButton>

			{writeError && (
				<StatusBox $variant="error">
					{writeError.includes("User rejected") || writeError.includes("denied")
						? "Transaction rejected."
						: writeError.slice(0, 300)}
				</StatusBox>
			)}

			{serverError && (
				<StatusBox $variant="error">
					Server registration failed: {serverError.slice(0, 300)}
				</StatusBox>
			)}

			{txHash && !isConfirmed && (
				<StatusBox $variant="pending">
					Transaction submitted: {txHash}
				</StatusBox>
			)}

			{isConfirmed && deployedAddress && !result && !serverError && (
				<StatusBox $variant="pending">
					Cap table deployed at {deployedAddress}. Registering with server...
				</StatusBox>
			)}

			{result && (
				<>
					<StatusBox $variant="success">
						Cap table deployed and registered successfully.
					</StatusBox>
					<FieldGroup>
						<FieldLabel>Issuer ID</FieldLabel>
						<ResponseBlock>{result._id}</ResponseBlock>
					</FieldGroup>
					<FieldGroup>
						<FieldLabel>Contract Address</FieldLabel>
						<ResponseBlock>{result.deployed_to}</ResponseBlock>
					</FieldGroup>
					<FieldGroup>
						<FieldLabel>Transaction Hash</FieldLabel>
						<ResponseBlock>{result.tx_hash}</ResponseBlock>
					</FieldGroup>
				</>
			)}
		</>
	);
}
