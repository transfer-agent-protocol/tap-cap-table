/**
 * Browser-persisted list of issuers the admin cares about.
 * Shared by Manage hub (manual add, mint success, sync-from-server).
 */
import type { LastMintedIssuer } from "./lastMintedIssuer";
import { getLastMintedIssuer } from "./lastMintedIssuer";

export const MY_ISSUERS_KEY = "tap_my_issuers";

export type StoredIssuer = LastMintedIssuer;

export function loadMyIssuers(): StoredIssuer[] {
	if (typeof window === "undefined") return [];
	let list: StoredIssuer[] = [];
	try {
		const raw = localStorage.getItem(MY_ISSUERS_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) list = parsed.filter((x) => x && typeof x._id === "string");
		}
	} catch {
		list = [];
	}

	// Always fold in the most recent mint if present
	const last = getLastMintedIssuer();
	if (last?._id && !list.some((i) => i._id === last._id)) {
		list = [last, ...list];
	}
	return list;
}

/** Persist. Call only after the client has finished hydrating from loadMyIssuers. */
export function saveMyIssuers(issuers: StoredIssuer[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(MY_ISSUERS_KEY, JSON.stringify(issuers));
	} catch (e) {
		console.warn("Failed to save issuer list", e);
	}
}

function isGenericName(name?: string): boolean {
	const n = (name || "").trim().toLowerCase();
	return !n || n === "cap table" || n === "manually added" || n === "added manually" || n === "unnamed company";
}

function pickName(...candidates: Array<string | undefined>): string {
	for (const c of candidates) {
		if (c && !isGenericName(c)) return c.trim();
	}
	for (const c of candidates) {
		if (c?.trim()) return c.trim();
	}
	return "Cap Table";
}

export function mergeIssuers(existing: StoredIssuer[], incoming: StoredIssuer[]): StoredIssuer[] {
	const byId = new Map<string, StoredIssuer>();
	for (const item of existing) {
		if (item?._id) byId.set(item._id, item);
	}
	for (const item of incoming) {
		if (!item?._id) continue;
		const prev = byId.get(item._id);
		byId.set(item._id, {
			_id: item._id,
			// Prefer real company names over placeholders from either side
			legal_name: pickName(item.legal_name, prev?.legal_name),
			deployed_to: item.deployed_to || prev?.deployed_to || "",
			tx_hash: item.tx_hash || prev?.tx_hash || "",
		});
	}
	// Newly synced first, then the rest of the local list
	const incomingIds = new Set(incoming.map((i) => i._id).filter(Boolean));
	const synced = incoming.map((i) => byId.get(i._id)!).filter(Boolean);
	const rest = [...byId.values()].filter((i) => !incomingIds.has(i._id));
	return [...synced, ...rest];
}
