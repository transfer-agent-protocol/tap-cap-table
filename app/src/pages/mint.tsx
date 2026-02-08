import { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useConnection, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { H2, P } from "../components/typography";
import { generateBytes16Id } from "../utils/uuid";
import {
	FACTORY_ADDRESS,
	capTableFactoryAbi,
	useWriteCapTableFactoryCreateCapTable,
} from "../config/contracts";

// --- Constants ---

const DECIMAL_SCALE = 10_000_000_000n; // 1e10
const OPERATOR_ADDRESS = (process.env.NEXT_PUBLIC_OPERATOR_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

function scaleShares(value: string): bigint {
	return BigInt(value) * DECIMAL_SCALE;
}

// --- Styled Components ---

const MintLayout = styled.div`
	display: flex;
	flex-flow: row nowrap;
	gap: 3rem;
	width: 100%;
	margin-top: 2rem;

	@media only screen and (max-width: 768px) {
		flex-flow: column nowrap;
		gap: 2rem;
	}
`;

const Panel = styled.section`
	flex: 1;
	display: flex;
	flex-flow: column nowrap;
	gap: 1rem;
`;

const FieldGroup = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.25rem;
`;

const FieldRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	gap: 1rem;

	& > * {
		flex: 1;
	}
`;

const FieldLabel = styled.label`
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: bold;
	text-transform: uppercase;
	letter-spacing: 0.05rem;
`;

const SectionLabel = styled.h3`
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: bold;
	margin: 0.5rem 0 0;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.75rem;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-family: inherit;
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.borderRadius.main};
	color: ${({ theme }) => theme.colors.text};
	box-sizing: border-box;

	&:focus {
		outline: 2px solid ${({ theme }) => theme.colors.main};
		outline-offset: 1px;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const MintButton = styled.button`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	background: ${({ theme }) => theme.colors.main};
	width: 100%;
	height: 3rem;
	margin-top: 1rem;
	border: none;
	border-radius: 4px;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: bold;
	font-family: inherit;
	color: ${({ theme }) => theme.colors.background};
	cursor: pointer;
	transition: all 0.168s cubic-bezier(0.211, 0.69, 0.313, 1);

	&:hover:not(:disabled) {
		opacity: 0.9;
	}

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

const StatusBox = styled.div<{ $variant?: "success" | "error" | "pending" }>`
	padding: 0.75rem;
	border-radius: ${({ theme }) => theme.borderRadius.main};
	font-size: ${({ theme }) => theme.fontSizes.small};
	word-break: break-all;
	border: 1px solid
		${({ $variant }) =>
			$variant === "success" ? "#16a34a" : $variant === "error" ? "#dc2626" : "#d97706"};
	background: ${({ $variant }) =>
		$variant === "success"
			? "rgba(22, 163, 74, 0.08)"
			: $variant === "error"
				? "rgba(220, 38, 38, 0.08)"
				: "rgba(217, 119, 6, 0.08)"};
`;

const Divider = styled.hr`
	width: 100%;
	border: none;
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	margin: 0.5rem 0;
`;

const ResponseBlock = styled.pre`
	padding: 0.75rem;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-family: inherit;
	background: ${({ theme }) => theme.colors.input};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.borderRadius.main};
	color: ${({ theme }) => theme.colors.text};
	word-break: break-all;
	white-space: pre-wrap;
	overflow-x: auto;
	margin: 0;
`;

// --- Types ---

interface IssuerResponse {
	_id: string;
	legal_name: string;
	deployed_to: string;
	tx_hash: string;
}

// --- Page Component ---

export default function MintPage() {
	const { address } = useConnection();
	const [mounted, setMounted] = useState(false);
	useEffect(() => { setMounted(true); }, []);
	const isConnected = mounted && !!address;

	// Required fields
	const [legalName, setLegalName] = useState("Transfer Agent Protocol");
	const [formationDate, setFormationDate] = useState("2022-08-23");
	const [countryOfFormation, setCountryOfFormation] = useState("US");
	const [sharesAuthorized, setSharesAuthorized] = useState("10000000");

	// Optional fields
	const [subdivision, setSubdivision] = useState("DE");
	const [taxId, setTaxId] = useState("88-3977591");
	const [taxCountry, setTaxCountry] = useState("US");
	const [emailAddress, setEmailAddress] = useState("alex@plume.org");
	const [emailType, setEmailType] = useState("BUSINESS");
	const [addressType, setAddressType] = useState("LEGAL");
	const [streetSuite, setStreetSuite] = useState("Empire State Building, 20 W 34th St. Suite 7700");
	const [city, setCity] = useState("New York");
	const [addressSubdivision, setAddressSubdivision] = useState("NY");
	const [addressCountry, setAddressCountry] = useState("US");
	const [postalCode, setPostalCode] = useState("10118");

	// Onchain state
	const [id, setId] = useState("");
	const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

	// Server registration state
	const [isRegistering, setIsRegistering] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<IssuerResponse | null>(null);

	// Generate bytes16 ID on mount
	useEffect(() => {
		setId(generateBytes16Id());
	}, []);

	const { writeContract, data: txHash, isPending: isWritePending, error: writeError, reset } =
		useWriteCapTableFactoryCreateCapTable();

	const {
		isLoading: isConfirming,
		isSuccess: isConfirmed,
		data: receipt,
	} = useWaitForTransactionReceipt({ hash: txHash });

	const isBusy = isWritePending || isConfirming || isRegistering;
	const canMint = isConnected && legalName.trim() !== "" && formationDate !== "" && countryOfFormation !== "" && sharesAuthorized !== "" && id !== "" && !isBusy && !result;

	// Step 1: Call createCapTable on the factory via user's wallet
	const handleMint = useCallback(() => {
		if (!canMint) return;
		reset();
		setDeployedAddress(null);
		setError(null);
		setResult(null);
		writeContract({
			address: FACTORY_ADDRESS,
			args: [id as `0x${string}`, legalName.trim(), scaleShares(sharesAuthorized), OPERATOR_ADDRESS],
		});
	}, [canMint, id, legalName, sharesAuthorized, writeContract, reset]);

	// Step 2: After tx confirms, parse event and register with server
	useEffect(() => {
		if (!receipt || !txHash || result || isRegistering) return;

		const logs = parseEventLogs({
			abi: capTableFactoryAbi,
			logs: receipt.logs,
			eventName: "CapTableCreated",
		});
		const proxyAddress = logs.length > 0 ? logs[0].args.capTableProxy : null;
		if (!proxyAddress) return;

		setDeployedAddress(proxyAddress);

		// Register with server
		const registerIssuer = async () => {
			setIsRegistering(true);
			try {
				const payload = {
					id, // bytes16 used in the contract — server converts to UUID
					legal_name: legalName.trim(),
					formation_date: formationDate,
					country_of_formation: countryOfFormation,
					...(subdivision && { country_subdivision_of_formation: subdivision }),
					initial_shares_authorized: sharesAuthorized,
					tax_ids: taxId ? [{ tax_id: taxId, country: taxCountry }] : [],
					email: emailAddress
						? { email_address: emailAddress, email_type: emailType }
						: undefined,
					address: streetSuite
						? {
								address_type: addressType,
								street_suite: streetSuite,
								city,
								country_subdivision: addressSubdivision,
								country: addressCountry,
								postal_code: postalCode,
							}
						: undefined,
					comments: [],
					deployed_to: proxyAddress,
					tx_hash: txHash,
				};

				const res = await fetch("/api/issuer/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				if (!res.ok) {
					const text = await res.text();
					throw new Error(text || `Server returned ${res.status}`);
				}

				const data = await res.json();
				setResult(data.issuer);
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setIsRegistering(false);
			}
		};

		registerIssuer();
	}, [receipt, txHash]);

	return (
		<>
			<H2>Mint Cap Table</H2>
			<StatusBox $variant="pending">
				This feature is not live yet — the hosted server and database are not deployed.
				Do not use, this will fail. But thanks for paying attention to development.
			</StatusBox>
			<P>Deploy a new cap table onchain. Connect your wallet to begin.</P>

			<MintLayout>
				{/* Left: Form */}
				<Panel>
					<FieldGroup>
						<FieldLabel>Legal Name *</FieldLabel>
						<Input
							type="text"
							value={legalName}
							onChange={(e) => setLegalName(e.target.value)}
							placeholder="Company legal name"
							disabled={isBusy}
						/>
					</FieldGroup>

					<FieldRow>
						<FieldGroup>
							<FieldLabel>Formation Date *</FieldLabel>
							<Input
								type="date"
								value={formationDate}
								onChange={(e) => setFormationDate(e.target.value)}
								disabled={isBusy}
							/>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Country *</FieldLabel>
							<Input
								type="text"
								value={countryOfFormation}
								onChange={(e) => setCountryOfFormation(e.target.value.toUpperCase())}
								placeholder="US"
								maxLength={2}
								disabled={isBusy}
							/>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>State / Subdivision</FieldLabel>
							<Input
								type="text"
								value={subdivision}
								onChange={(e) => setSubdivision(e.target.value.toUpperCase())}
								placeholder="DE"
								disabled={isBusy}
							/>
						</FieldGroup>
					</FieldRow>

					<FieldGroup>
						<FieldLabel>Initial Shares Authorized *</FieldLabel>
						<Input
							type="number"
							value={sharesAuthorized}
							onChange={(e) => setSharesAuthorized(e.target.value)}
							placeholder="10000000"
							min="1"
							disabled={isBusy}
						/>
					</FieldGroup>

					<Divider />

					<SectionLabel>Tax ID</SectionLabel>
					<FieldRow>
						<FieldGroup>
							<FieldLabel>Tax ID</FieldLabel>
							<Input
								type="text"
								value={taxId}
								onChange={(e) => setTaxId(e.target.value)}
								placeholder="88-3977591"
								disabled={isBusy}
							/>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Country</FieldLabel>
							<Input
								type="text"
								value={taxCountry}
								onChange={(e) => setTaxCountry(e.target.value.toUpperCase())}
								placeholder="US"
								maxLength={2}
								disabled={isBusy}
							/>
						</FieldGroup>
					</FieldRow>

					<SectionLabel>Email</SectionLabel>
					<FieldRow>
						<FieldGroup>
							<FieldLabel>Email Address</FieldLabel>
							<Input
								type="email"
								value={emailAddress}
								onChange={(e) => setEmailAddress(e.target.value)}
								placeholder="dev@example.com"
								disabled={isBusy}
							/>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Type</FieldLabel>
							<Input
								type="text"
								value={emailType}
								onChange={(e) => setEmailType(e.target.value.toUpperCase())}
								placeholder="BUSINESS"
								disabled={isBusy}
							/>
						</FieldGroup>
					</FieldRow>

					<SectionLabel>Address</SectionLabel>
					<FieldGroup>
						<FieldLabel>Street / Suite</FieldLabel>
						<Input
							type="text"
							value={streetSuite}
							onChange={(e) => setStreetSuite(e.target.value)}
							placeholder="447 Broadway, 2nd Fl #713"
							disabled={isBusy}
						/>
					</FieldGroup>
					<FieldRow>
						<FieldGroup>
							<FieldLabel>City</FieldLabel>
							<Input
								type="text"
								value={city}
								onChange={(e) => setCity(e.target.value)}
								placeholder="New York"
								disabled={isBusy}
							/>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>State</FieldLabel>
							<Input
								type="text"
								value={addressSubdivision}
								onChange={(e) => setAddressSubdivision(e.target.value.toUpperCase())}
								placeholder="NY"
								disabled={isBusy}
							/>
						</FieldGroup>
					</FieldRow>
					<FieldRow>
						<FieldGroup>
							<FieldLabel>Country</FieldLabel>
							<Input
								type="text"
								value={addressCountry}
								onChange={(e) => setAddressCountry(e.target.value.toUpperCase())}
								placeholder="US"
								maxLength={2}
								disabled={isBusy}
							/>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Postal Code</FieldLabel>
							<Input
								type="text"
								value={postalCode}
								onChange={(e) => setPostalCode(e.target.value)}
								placeholder="10013"
								disabled={isBusy}
							/>
						</FieldGroup>
						<FieldGroup>
							<FieldLabel>Address Type</FieldLabel>
							<Input
								type="text"
								value={addressType}
								onChange={(e) => setAddressType(e.target.value.toUpperCase())}
								placeholder="LEGAL"
								disabled={isBusy}
							/>
						</FieldGroup>
					</FieldRow>
				</Panel>

				{/* Right: Actions + Response */}
				<Panel>
					{!isConnected && (
						<StatusBox $variant="pending">
							Connect your wallet using the button in the navigation bar to mint a cap table.
						</StatusBox>
					)}

					{isConnected && (
						<>
							<MintButton onClick={handleMint} disabled={!canMint}>
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
									{writeError.message.includes("User rejected")
										? "Transaction rejected."
										: writeError.message.slice(0, 300)}
								</StatusBox>
							)}

							{error && (
								<StatusBox $variant="error">
									Server registration failed: {error.slice(0, 300)}
								</StatusBox>
							)}

							{txHash && !isConfirmed && (
								<StatusBox $variant="pending">
									Transaction submitted: {txHash}
								</StatusBox>
							)}

							{isConfirmed && deployedAddress && !result && !error && (
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
					)}
				</Panel>
			</MintLayout>
		</>
	);
}
