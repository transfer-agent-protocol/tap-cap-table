import { useState, useCallback, useEffect } from "react";
import { useConnection, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { generateBytes16Id } from "../utils/uuid";
import {
	FACTORY_ADDRESS,
	DECIMAL_SCALE,
	OPERATOR_ADDRESS,
	capTableFactoryAbi,
	useWriteCapTableFactoryCreateCapTable,
} from "../config/contracts";
import { registerIssuer, type IssuerResponse, type RegisterIssuerPayload } from "../services/registerIssuer";
import { SAMPLE_ISSUER } from "../samples/mintIssuer";

export interface IssuerFormFields {
	legalName: string;
	formationDate: string;
	countryOfFormation: string;
	sharesAuthorized: string;
	subdivision: string;
	taxId: string;
	taxCountry: string;
	emailAddress: string;
	emailType: string;
	addressType: string;
	streetSuite: string;
	city: string;
	addressSubdivision: string;
	addressCountry: string;
	postalCode: string;
}

function scaleShares(value: string): bigint {
	return BigInt(value) * DECIMAL_SCALE;
}

export interface UseMintIssuerReturn {
	// Connection
	isConnected: boolean;

	// Form fields and setters
	fields: IssuerFormFields;
	setField: <K extends keyof IssuerFormFields>(key: K, value: IssuerFormFields[K]) => void;

	// Flow state
	canMint: boolean;
	isBusy: boolean;
	isWritePending: boolean;
	isConfirming: boolean;
	isRegistering: boolean;

	// Actions
	handleMint: () => void;

	// Results / errors
	txHash: `0x${string}` | undefined;
	isConfirmed: boolean;
	deployedAddress: string | null;
	writeError: string | null;
	serverError: string | null;
	result: IssuerResponse | null;
}

export function useMintIssuer(): UseMintIssuerReturn {
	// --- Connection ---
	const { address } = useConnection();
	const [mounted, setMounted] = useState(false);
	useEffect(() => { setMounted(true); }, []);
	const isConnected = mounted && !!address;

	// --- Form fields ---
	const [fields, setFields] = useState<IssuerFormFields>({
		legalName: SAMPLE_ISSUER.legalName,
		formationDate: SAMPLE_ISSUER.formationDate,
		countryOfFormation: SAMPLE_ISSUER.countryOfFormation,
		sharesAuthorized: SAMPLE_ISSUER.sharesAuthorized,
		subdivision: SAMPLE_ISSUER.subdivision || "",
		taxId: SAMPLE_ISSUER.taxId || "",
		taxCountry: SAMPLE_ISSUER.taxCountry || "",
		emailAddress: SAMPLE_ISSUER.emailAddress || "",
		emailType: SAMPLE_ISSUER.emailType || "",
		addressType: SAMPLE_ISSUER.addressType || "",
		streetSuite: SAMPLE_ISSUER.streetSuite || "",
		city: SAMPLE_ISSUER.city || "",
		addressSubdivision: SAMPLE_ISSUER.addressSubdivision || "",
		addressCountry: SAMPLE_ISSUER.addressCountry || "",
		postalCode: SAMPLE_ISSUER.postalCode || "",
	});

	const setField = useCallback(<K extends keyof IssuerFormFields>(key: K, value: IssuerFormFields[K]) => {
		setFields((prev) => ({ ...prev, [key]: value }));
	}, []);

	// --- Onchain state ---
	const [id, setId] = useState("");
	const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

	// --- Server registration state ---
	const [isRegistering, setIsRegistering] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [result, setResult] = useState<IssuerResponse | null>(null);

	// Generate bytes16 ID on mount
	useEffect(() => { setId(generateBytes16Id()); }, []);

	// --- Wagmi hooks ---
	const { writeContract, data: txHash, isPending: isWritePending, error: writeError, reset } =
		useWriteCapTableFactoryCreateCapTable();

	const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
		useWaitForTransactionReceipt({ hash: txHash });

	// --- Derived state ---
	const isBusy = isWritePending || isConfirming || isRegistering;
	const canMint =
		isConnected &&
		fields.legalName.trim() !== "" &&
		fields.formationDate !== "" &&
		fields.countryOfFormation !== "" &&
		fields.sharesAuthorized !== "" &&
		id !== "" &&
		!isBusy &&
		!result;

	// --- Step 1: submit tx ---
	const handleMint = useCallback(() => {
		if (!canMint) return;
		reset();
		setDeployedAddress(null);
		setServerError(null);
		setResult(null);
		writeContract({
			address: FACTORY_ADDRESS,
			args: [id as `0x${string}`, fields.legalName.trim(), scaleShares(fields.sharesAuthorized), OPERATOR_ADDRESS],
		});
	}, [canMint, id, fields.legalName, fields.sharesAuthorized, writeContract, reset]);

	// --- Step 2: parse event + register with server ---
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

		(async () => {
			setIsRegistering(true);
			try {
				const payload: RegisterIssuerPayload = {
					id,
					legal_name: fields.legalName.trim(),
					formation_date: fields.formationDate,
					country_of_formation: fields.countryOfFormation,
					...(fields.subdivision && { country_subdivision_of_formation: fields.subdivision }),
					initial_shares_authorized: fields.sharesAuthorized,
					tax_ids: fields.taxId ? [{ tax_id: fields.taxId, country: fields.taxCountry }] : [],
					email: fields.emailAddress
						? { email_address: fields.emailAddress, email_type: fields.emailType }
						: undefined,
					address: fields.streetSuite
						? {
								address_type: fields.addressType,
								street_suite: fields.streetSuite,
								city: fields.city,
								country_subdivision: fields.addressSubdivision,
								country: fields.addressCountry,
								postal_code: fields.postalCode,
							}
						: undefined,
					comments: [],
					deployed_to: proxyAddress,
					tx_hash: txHash,
				};
				const issuer = await registerIssuer(payload);
				setResult(issuer);
			} catch (err) {
				setServerError(err instanceof Error ? err.message : String(err));
			} finally {
				setIsRegistering(false);
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [receipt, txHash]);

	return {
		isConnected,
		fields,
		setField,
		canMint,
		isBusy,
		isWritePending,
		isConfirming,
		isRegistering,
		handleMint,
		txHash,
		isConfirmed,
		deployedAddress,
		writeError: writeError?.message ?? null,
		serverError,
		result,
	};
}
