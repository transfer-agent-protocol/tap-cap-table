/**
 * Status for a holdings row.
 * - Confirmed: receipt mined successfully (txHash) OR position returned from chain
 * - Pending: submitted this session, no receipt yet
 */
export type HoldingStatus = "Pending" | "Confirmed";

export function holdingStatusForIssuance(iss: {
	txHash?: string | null;
	confirmed?: boolean;
}): HoldingStatus {
	if (iss.confirmed || (iss.txHash && iss.txHash.length > 0)) return "Confirmed";
	return "Pending";
}

/** True when we still expect the poller / holdings API to catch up. */
export function issuanceStillSyncing(iss: {
	txHash?: string | null;
	confirmed?: boolean;
	stakeholder_id: string;
	stock_class_id: string;
}, onchainKeys: Set<string>): boolean {
	const key = `${iss.stakeholder_id}|${iss.stock_class_id}`;
	if (onchainKeys.has(key)) return false;
	// Confirmed onchain via wallet — not "syncing" for the user; holdings may still lag
	if (iss.confirmed || iss.txHash) return false;
	return true;
}
