import { type Hex } from "viem";

/**
 * Generate a random bytes16 ID from a UUID.
 * UUIDs are 128-bit (16 bytes), matching Solidity's bytes16.
 * Strips dashes and prepends 0x.
 */
export function generateBytes16Id(): Hex {
	const uuid = crypto.randomUUID();
	return `0x${uuid.replace(/-/g, "")}` as Hex;
}

/**
 * Convert a bytes16 hex string (0x + 32 hex chars, no dashes) back into a
 * canonical lower-case UUID string with dashes. Used so the metadata _id stored
 * in Mongo matches the bytes16 id we sent onchain (the poller converts the
 * event's bytes16 back to this same UUID form).
 */
export function bytes16ToUuid(bytes16: string): string {
	const hex = bytes16.startsWith("0x") ? bytes16.slice(2) : bytes16;
	if (hex.length !== 32) {
		throw new Error(`bytes16ToUuid: expected 32 hex chars, got ${hex.length}`);
	}
	return [
		hex.slice(0, 8),
		hex.slice(8, 12),
		hex.slice(12, 16),
		hex.slice(16, 20),
		hex.slice(20, 32),
	].join("-").toLowerCase();
}

/**
 * Convert a UUID (with or without dashes) into a bytes16 hex string (0x + 32 hex chars).
 * Idempotent: if `value` is already in 0x bytes16 form it is returned unchanged.
 */
export function uuidToBytes16(value: string): Hex {
	const trimmed = value.startsWith("0x") ? value.slice(2) : value;
	const hex = trimmed.replace(/-/g, "");
	if (hex.length !== 32) {
		throw new Error(`uuidToBytes16: expected 32 hex chars, got ${hex.length}`);
	}
	return `0x${hex.toLowerCase()}` as Hex;
}
