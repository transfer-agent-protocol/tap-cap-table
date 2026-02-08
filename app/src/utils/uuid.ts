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
