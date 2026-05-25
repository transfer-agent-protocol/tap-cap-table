import { useState, useCallback, useEffect } from "react";
import type { IssuerResponse } from "../services/registerIssuer";
import { createStockClass, type CreateStockClassPayload, type StockClassResponse } from "../services/createStockClass";
import { createStakeholder, type CreateStakeholderPayload, type StakeholderResponse } from "../services/createStakeholder";
import { createStockIssuance, type CreateStockIssuancePayload, type StockIssuanceResponse } from "../services/createStockIssuance";

export interface HoldingsData {
	issuer?: any;
	stockClasses?: any[];
	holdings?: Array<{
		stakeholder: any;
		stockClass: any;
		quantity: string;
		sharePrice?: any;
	}>;
}

export interface UseCapTableManagerReturn {
	// Context from successful mint
	issuer: IssuerResponse | null;
	contractAddress: string | null;

	// Fetched / derived data (primary source for the table)
	holdings: HoldingsData | null;
	isLoadingHoldings: boolean;
	holdingsError: string | null;

	// Local optimistic lists (for instant UI feedback + dropdowns before poller/refresh)
	createdStockClasses: StockClassResponse["stockClass"][];
	createdStakeholders: StakeholderResponse["stakeholder"][];
	createdIssuances: StockIssuanceResponse["stockIssuance"][];

	// Create actions for the legacy server-operator flow (server signs the onchain tx).
	// Direct wallet flows go through the registerXxxOnchain services, not through this manager.
	createStockClass: (data: CreateStockClassPayload["data"]) => Promise<void>;
	createStakeholder: (data: CreateStakeholderPayload["data"]) => Promise<void>;
	createStockIssuance: (data: CreateStockIssuancePayload["data"]) => Promise<void>;

	// Manual refresh
	refreshHoldings: () => void;

	// Errors per action (simple string for StatusBox)
	lastError: string | null;
	clearError: () => void;
}

export function useCapTableManager(issuerResult: IssuerResponse | null): UseCapTableManagerReturn {
	const [holdings, setHoldings] = useState<HoldingsData | null>(null);
	const [isLoadingHoldings, setIsLoadingHoldings] = useState(false);
	const [holdingsError, setHoldingsError] = useState<string | null>(null);

	const [createdStockClasses, setCreatedStockClasses] = useState<any[]>([]);
	const [createdStakeholders, setCreatedStakeholders] = useState<any[]>([]);
	const [createdIssuances, setCreatedIssuances] = useState<any[]>([]);

	const [lastError, setLastError] = useState<string | null>(null);

	const issuerId = issuerResult?._id ?? null;
	const contractAddress = issuerResult?.deployed_to ?? null;

	const fetchHoldings = useCallback(async () => {
		if (!issuerId) return;
		setIsLoadingHoldings(true);
		setHoldingsError(null);
		try {
			const res = await fetch(`/api/cap-table/holdings/stock?issuerId=${encodeURIComponent(issuerId)}`);
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `Failed to load holdings (${res.status})`);
			}
			const data = await res.json();
			setHoldings(data);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			setHoldingsError(msg);
		} finally {
			setIsLoadingHoldings(false);
		}
	}, [issuerId]);

	// Auto-fetch holdings once we have a successful issuer result in this session
	useEffect(() => {
		if (issuerId) {
			fetchHoldings();
		} else {
			// Reset when mint result is cleared
			setHoldings(null);
			setCreatedStockClasses([]);
			setCreatedStakeholders([]);
			setCreatedIssuances([]);
		}
	}, [issuerId, fetchHoldings]);

	const refreshHoldings = useCallback(() => {
		fetchHoldings();
	}, [fetchHoldings]);

	const clearError = useCallback(() => setLastError(null), []);

	const handleCreateStockClass = useCallback(
		async (data: CreateStockClassPayload["data"]) => {
			if (!issuerId) return;
			setLastError(null);
			try {
				const res = await createStockClass({ issuerId, data });
				setCreatedStockClasses((prev) => [...prev, res.stockClass]);
				// Refresh the authoritative table shortly after (poller will also update)
				setTimeout(() => fetchHoldings(), 800);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				setLastError(msg);
				throw err;
			}
		},
		[issuerId, fetchHoldings],
	);

	const handleCreateStakeholder = useCallback(
		async (data: CreateStakeholderPayload["data"]) => {
			if (!issuerId) return;
			setLastError(null);
			try {
				const res = await createStakeholder({ issuerId, data });
				setCreatedStakeholders((prev) => [...prev, res.stakeholder]);
				setTimeout(() => fetchHoldings(), 800);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				setLastError(msg);
				throw err;
			}
		},
		[issuerId, fetchHoldings],
	);

	const handleCreateStockIssuance = useCallback(
		async (data: CreateStockIssuancePayload["data"]) => {
			if (!issuerId) return;
			setLastError(null);
			try {
				const payload: CreateStockIssuancePayload = { issuerId, data };
				const res = await createStockIssuance(payload);
				setCreatedIssuances((prev) => [...prev, res.stockIssuance]);
				setTimeout(() => fetchHoldings(), 800);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				setLastError(msg);
				throw err;
			}
		},
		[issuerId, fetchHoldings],
	);

	return {
		issuer: issuerResult,
		contractAddress,
		holdings,
		isLoadingHoldings,
		holdingsError,
		createdStockClasses,
		createdStakeholders,
		createdIssuances,
		createStockClass: handleCreateStockClass,
		createStakeholder: handleCreateStakeholder,
		createStockIssuance: handleCreateStockIssuance,
		refreshHoldings,
		lastError,
		clearError,
	};
}
