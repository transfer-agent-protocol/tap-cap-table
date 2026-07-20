/**
 * Pure ordering helpers for the wallet modal (Uniswap-style: recent → detected → rest).
 * Kept free of React so node:test can cover them.
 */

export interface OrderableConnector {
	uid: string;
	id: string;
	name: string;
	type: string;
	/** True when an extension/provider is present in the browser. */
	detected?: boolean;
}

export function orderConnectors<T extends OrderableConnector>(
	connectors: T[],
	recentId: string | null,
): T[] {
	const seen = new Set<string>();
	const hasNamedInjected = connectors.some((o) => o.type === "injected" && o.id !== "injected");
	const unique: T[] = [];
	for (const c of connectors) {
		const key = c.uid || c.id;
		if (seen.has(key)) continue;
		// Prefer named EIP-6963 wallets over the generic "Injected" fallback when peers exist.
		if (c.id === "injected" && hasNamedInjected) continue;
		seen.add(key);
		unique.push(c);
	}

	return unique.slice().sort((a, b) => {
		const aRecent = recentId != null && (a.id === recentId || a.uid === recentId) ? 0 : 1;
		const bRecent = recentId != null && (b.id === recentId || b.uid === recentId) ? 0 : 1;
		if (aRecent !== bRecent) return aRecent - bRecent;

		const aDet = a.detected ? 0 : 1;
		const bDet = b.detected ? 0 : 1;
		if (aDet !== bDet) return aDet - bDet;

		// Generic "Injected" last among non-recent
		const aGeneric = a.id === "injected" ? 1 : 0;
		const bGeneric = b.id === "injected" ? 1 : 0;
		if (aGeneric !== bGeneric) return aGeneric - bGeneric;

		return a.name.localeCompare(b.name);
	});
}

/** Whether a connector should show a Detected badge (installed extension). */
export function isConnectorDetected(connector: {
	id: string;
	type: string;
	rdns?: string | readonly string[] | null;
}): boolean {
	if (typeof window === "undefined") return false;
	// EIP-6963 connectors are only listed when a provider announced itself.
	if (connector.type === "injected" && connector.id !== "injected") return true;
	if (connector.id === "mock") return true;
	if (connector.id === "injected") {
		return Boolean((window as Window & { ethereum?: unknown }).ethereum);
	}
	return false;
}
