import type { IssuerResponse } from "../services/registerIssuer";
import { useResource } from "./useResource";

export interface HoldingsData {
	issuer?: any;
	stockClasses?: any[];
	stakeholders?: any[];
	holdings?: Array<{
		stakeholder: any;
		stockClass: any;
		quantity: string | number;
		sharePrice?: any;
	}>;
}

export interface UseCapTableManagerReturn {
	issuer: IssuerResponse | null;
	contractAddress: string | null;
	holdings: HoldingsData | null;
	isLoadingHoldings: boolean;
	isRevalidatingHoldings: boolean;
	holdingsError: string | null;
	refreshHoldings: () => void;
}

/**
 * Read-only cap-table data for the manage UI.
 * Direct-wallet creates go through useDirect* + register*Onchain — not this hook.
 * Pass shouldPoll=true while optimistic rows are awaiting poller reconciliation.
 */
export function useCapTableManager(
	issuerResult: IssuerResponse | null,
	opts: { shouldPoll?: boolean } = {},
): UseCapTableManagerReturn {
	const issuerId = issuerResult?._id ?? null;
	const contractAddress = issuerResult?.deployed_to ?? null;
	const url = issuerId
		? `/api/cap-table/holdings/stock?issuerId=${encodeURIComponent(issuerId)}`
		: null;

	const {
		data: holdings,
		error: holdingsError,
		isLoading: isLoadingHoldings,
		isRevalidating: isRevalidatingHoldings,
		refetch: refreshHoldings,
	} = useResource<HoldingsData>(url, {
		intervalMs: 5000,
		shouldPoll: !!opts.shouldPoll,
	});

	return {
		issuer: issuerResult,
		contractAddress,
		holdings,
		isLoadingHoldings,
		isRevalidatingHoldings,
		holdingsError,
		refreshHoldings,
	};
}
