/**
 * Shared domain units for TAP cap-table writes.
 * SCALE is 1e10 everywhere on the write path; the poller unscales by the same factor.
 */

/** Protocol fixed-point scale for share quantities and prices (not currency-specific USDC). */
export const SCALE = 10_000_000_000n; // 1e10
export const DECIMAL_SCALE = SCALE;

/**
 * Scale a whole-number share quantity with BigInt math (safe above 2^53).
 * Accepts string or number; rejects non-integers and negatives.
 * @param {string | number | bigint} quantity
 * @returns {bigint}
 */
export function scaleShares(quantity) {
	const asString = typeof quantity === "bigint" ? quantity.toString() : String(quantity).trim();
	if (!/^\d+$/.test(asString)) {
		throw new Error(`scaleShares: expected non-negative whole number, got ${JSON.stringify(quantity)}`);
	}
	return BigInt(asString) * SCALE;
}

/**
 * Scale a human decimal amount (price) to 1e10 fixed point.
 * Uses integer arithmetic on the decimal string when possible to avoid float drift.
 * @param {string | number} amount
 * @returns {bigint}
 */
export function scaleAmount(amount) {
	const raw = String(amount).trim();
	if (!/^-?\d+(\.\d+)?$/.test(raw)) {
		throw new Error(`scaleAmount: invalid decimal ${JSON.stringify(amount)}`);
	}
	const negative = raw.startsWith("-");
	const body = negative ? raw.slice(1) : raw;
	const [wholePart, fracPart = ""] = body.split(".");
	const fracPadded = (fracPart + "0000000000").slice(0, 10); // 1e10 digits
	const combined = BigInt(wholePart || "0") * SCALE + BigInt(fracPadded || "0");
	return negative ? -combined : combined;
}

/**
 * Unscale a 1e10 fixed-point value to a human decimal string.
 * @param {bigint | string | number} scaled
 * @returns {string}
 */
export function unscale(scaled) {
	const value = typeof scaled === "bigint" ? scaled : BigInt(String(scaled));
	const neg = value < 0n;
	const abs = neg ? -value : value;
	const whole = abs / SCALE;
	const frac = abs % SCALE;
	const fracStr = frac.toString().padStart(10, "0").replace(/0+$/, "");
	const out = fracStr.length ? `${whole.toString()}.${fracStr}` : whole.toString();
	return neg ? `-${out}` : out;
}

/**
 * @param {string} bytes16 - 0x + 32 hex chars
 * @returns {string} lower-case UUID with dashes
 */
export function bytes16ToUuid(bytes16) {
	const hex = bytes16.startsWith("0x") || bytes16.startsWith("0X") ? bytes16.slice(2) : bytes16;
	if (hex.length !== 32 || !/^[0-9a-fA-F]+$/.test(hex)) {
		throw new Error(`bytes16ToUuid: expected 32 hex chars, got ${hex.length}`);
	}
	const h = hex.toLowerCase();
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

/**
 * @param {string} value - UUID (with/without dashes) or already-0x bytes16
 * @returns {`0x${string}`}
 */
export function uuidToBytes16(value) {
	const trimmed = value.startsWith("0x") || value.startsWith("0X") ? value.slice(2) : value;
	const hex = trimmed.replace(/-/g, "");
	if (hex.length !== 32 || !/^[0-9a-fA-F]+$/.test(hex)) {
		throw new Error(`uuidToBytes16: expected 32 hex chars, got ${hex.length}`);
	}
	return /** @type {`0x${string}`} */ (`0x${hex.toLowerCase()}`);
}

/**
 * Generate a random bytes16 from crypto.randomUUID when available.
 * @returns {`0x${string}`}
 */
export function generateBytes16Id() {
	const uuid =
		typeof globalThis.crypto?.randomUUID === "function"
			? globalThis.crypto.randomUUID()
			: // Node <19 fallback via random bytes if needed — callers in Node 20+ have crypto
				(() => {
					throw new Error("generateBytes16Id: crypto.randomUUID is required");
				})();
	return uuidToBytes16(uuid);
}

/**
 * @typedef {object} ShareCapInput
 * @property {string | number | bigint} quantity - human whole shares to issue
 * @property {string | number | bigint} issuerAuthorized
 * @property {string | number | bigint} [issuerIssued]
 * @property {string | number | bigint} [classAuthorized]
 * @property {string | number | bigint} [classIssued]
 */

/**
 * @typedef {object} ShareCapResult
 * @property {boolean} ok
 * @property {string[]} errors
 * @property {string[]} warnings
 */

function toNonNegNumber(value, label) {
	if (value == null || value === "") return 0;
	const n = typeof value === "bigint" ? Number(value) : Number(value);
	if (!Number.isFinite(n) || n < 0) {
		throw new Error(`${label}: expected non-negative number, got ${JSON.stringify(value)}`);
	}
	return n;
}

/**
 * Pre-sign / pre-persist share-cap checks (human units, not scaled).
 * Blocks issuance over issuer remaining or class remaining.
 * Warns when class authorized exceeds issuer authorized (creation is allowed; issuance still bounded).
 * @param {ShareCapInput} input
 * @returns {ShareCapResult}
 */
export function validateShareCaps(input) {
	/** @type {string[]} */
	const errors = [];
	/** @type {string[]} */
	const warnings = [];

	let qty;
	try {
		qty = toNonNegNumber(input.quantity, "quantity");
	} catch (e) {
		return { ok: false, errors: [e instanceof Error ? e.message : String(e)], warnings };
	}
	if (!Number.isInteger(qty) && String(input.quantity).includes(".")) {
		// allow integer-valued floats like 100.0
		if (Math.floor(qty) !== qty) {
			errors.push("quantity must be a whole number of shares");
		}
	}

	const issuerAuthorized = toNonNegNumber(input.issuerAuthorized, "issuerAuthorized");
	const issuerIssued = toNonNegNumber(input.issuerIssued ?? 0, "issuerIssued");
	const classAuthorized =
		input.classAuthorized == null || input.classAuthorized === ""
			? null
			: toNonNegNumber(input.classAuthorized, "classAuthorized");
	const classIssued = toNonNegNumber(input.classIssued ?? 0, "classIssued");

	const issuerRemaining = issuerAuthorized - issuerIssued;
	if (qty > issuerRemaining) {
		errors.push(
			`Issuance of ${qty.toLocaleString()} exceeds issuer remaining authorized shares (${issuerRemaining.toLocaleString()} of ${issuerAuthorized.toLocaleString()}).`,
		);
	}

	if (classAuthorized != null) {
		const classRemaining = classAuthorized - classIssued;
		if (qty > classRemaining) {
			errors.push(
				`Issuance of ${qty.toLocaleString()} exceeds stock class remaining authorized shares (${classRemaining.toLocaleString()} of ${classAuthorized.toLocaleString()}).`,
			);
		}
		if (classAuthorized > issuerAuthorized) {
			warnings.push(
				`Stock class authorized (${classAuthorized.toLocaleString()}) exceeds issuer authorized (${issuerAuthorized.toLocaleString()}). Issuance is still bounded by the issuer total.`,
			);
		}
	}

	return { ok: errors.length === 0, errors, warnings };
}

/**
 * Convenience: throw if share caps fail (server rejection path).
 * @param {ShareCapInput} input
 */
export function assertShareCaps(input) {
	const result = validateShareCaps(input);
	if (!result.ok) {
		const err = new Error(result.errors.join(" "));
		err.name = "ShareCapError";
		/** @type {any} */ (err).warnings = result.warnings;
		throw err;
	}
	return result;
}
