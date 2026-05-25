import type { IssuerResponse } from "../services/registerIssuer";

const STORAGE_KEY = "tap_last_minted_issuer";

export type LastMintedIssuer = Pick<IssuerResponse, "_id" | "legal_name" | "deployed_to" | "tx_hash">;

export function saveLastMintedIssuer(issuer: IssuerResponse) {
	try {
		const toStore: LastMintedIssuer = {
			_id: issuer._id,
			legal_name: issuer.legal_name,
			deployed_to: issuer.deployed_to,
			tx_hash: issuer.tx_hash,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
	} catch (e) {
		console.warn("Failed to save last minted issuer to localStorage", e);
	}
}

export function getLastMintedIssuer(): LastMintedIssuer | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as LastMintedIssuer;
	} catch (e) {
		console.warn("Failed to read last minted issuer from localStorage", e);
		return null;
	}
}

