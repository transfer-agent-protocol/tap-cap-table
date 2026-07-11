/**
 * Persist wallet actions per issuer so Activity can show real TX hashes
 * across reloads (poller history is separate and often lags).
 */

export type ActivityKind =
	| "stock_class"
	| "stakeholder"
	| "stock_issuance"
	| "stock_transfer"
	| "other";

export type ActivityStatus = "pending" | "confirmed" | "reverted";

export interface ActivityEntry {
	id: string;
	issuerId: string;
	kind: ActivityKind;
	/** Short human label, e.g. "Stock issuance" */
	type: string;
	/** e.g. custom cert id, legal name, class name */
	details: string;
	quantity?: string;
	price?: string;
	date: string; // YYYY-MM-DD
	txHash?: string;
	status: ActivityStatus;
	createdAt: number;
}

const keyFor = (issuerId: string) => `tap_activity_${issuerId}`;

function storage(): Storage | null {
	try {
		if (typeof globalThis === "undefined") return null;
		const w = globalThis as typeof globalThis & { window?: Window; localStorage?: Storage };
		return w.localStorage ?? w.window?.localStorage ?? null;
	} catch {
		return null;
	}
}

export function loadActivity(issuerId: string): ActivityEntry[] {
	const store = storage();
	if (!store || !issuerId) return [];
	try {
		const raw = store.getItem(keyFor(issuerId));
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function saveActivity(issuerId: string, entries: ActivityEntry[]): void {
	const store = storage();
	if (!store || !issuerId) return;
	try {
		store.setItem(keyFor(issuerId), JSON.stringify(entries.slice(0, 200)));
	} catch (e) {
		console.warn("Failed to save activity log", e);
	}
}

export function appendActivity(issuerId: string, entry: ActivityEntry): ActivityEntry[] {
	const prev = loadActivity(issuerId);
	const next = [entry, ...prev.filter((e) => e.id !== entry.id)];
	saveActivity(issuerId, next);
	return next;
}

export function updateActivity(
	issuerId: string,
	id: string,
	patch: Partial<ActivityEntry>,
): ActivityEntry[] {
	const prev = loadActivity(issuerId);
	const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
	saveActivity(issuerId, next);
	return next;
}

export function markActivityByTx(
	issuerId: string,
	txHash: string,
	status: ActivityStatus,
): ActivityEntry[] {
	const prev = loadActivity(issuerId);
	const next = prev.map((e) =>
		e.txHash && e.txHash.toLowerCase() === txHash.toLowerCase() ? { ...e, status, txHash } : e,
	);
	saveActivity(issuerId, next);
	return next;
}

export const EXPLORER_TX = (hash: string) => `https://explorer.plume.org/tx/${hash}`;
