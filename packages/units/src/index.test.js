import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	SCALE,
	scaleShares,
	scaleAmount,
	unscale,
	bytes16ToUuid,
	uuidToBytes16,
	validateShareCaps,
} from "./index.js";

describe("scaleShares", () => {
	it("scales whole numbers by 1e10", () => {
		assert.equal(scaleShares("100"), 100n * SCALE);
		assert.equal(scaleShares(1_000_000), 1_000_000n * SCALE);
	});
	it("rejects fractions", () => {
		assert.throws(() => scaleShares("1.5"), /whole number/);
	});
});

describe("scaleAmount / unscale", () => {
	it("round-trips prices without float footguns", () => {
		assert.equal(scaleAmount("4.20"), 42_000_000_000n);
		assert.equal(unscale(scaleAmount("4.20")), "4.2");
		assert.equal(unscale(scaleAmount("0.0000000001")), "0.0000000001");
	});
	it("handles whole amounts", () => {
		assert.equal(scaleAmount("10"), 10n * SCALE);
		assert.equal(unscale(10n * SCALE), "10");
	});
});

describe("uuid ↔ bytes16", () => {
	const uuid = "550e8400-e29b-41d4-a716-446655440000";
	const bytes = "0x550e8400e29b41d4a716446655440000";

	it("converts both directions", () => {
		assert.equal(uuidToBytes16(uuid), bytes);
		assert.equal(bytes16ToUuid(bytes), uuid);
	});
	it("is idempotent for bytes16 input", () => {
		assert.equal(uuidToBytes16(bytes), bytes);
	});
});

describe("validateShareCaps", () => {
	it("allows issuance within issuer and class remaining", () => {
		const r = validateShareCaps({
			quantity: 100,
			issuerAuthorized: 1000,
			issuerIssued: 200,
			classAuthorized: 500,
			classIssued: 50,
		});
		assert.equal(r.ok, true);
		assert.equal(r.errors.length, 0);
	});
	it("blocks over issuer remaining", () => {
		const r = validateShareCaps({
			quantity: 900,
			issuerAuthorized: 1000,
			issuerIssued: 200,
			classAuthorized: 5000,
		});
		assert.equal(r.ok, false);
		assert.match(r.errors[0], /issuer remaining/);
	});
	it("blocks over class remaining", () => {
		const r = validateShareCaps({
			quantity: 100,
			issuerAuthorized: 10000,
			classAuthorized: 50,
			classIssued: 0,
		});
		assert.equal(r.ok, false);
		assert.match(r.errors[0], /stock class remaining/);
	});
	it("warns when class authorized > issuer authorized", () => {
		const r = validateShareCaps({
			quantity: 10,
			issuerAuthorized: 100,
			classAuthorized: 500,
		});
		assert.equal(r.ok, true);
		assert.equal(r.warnings.length, 1);
	});
});
