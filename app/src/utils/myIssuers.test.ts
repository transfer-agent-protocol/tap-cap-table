/**
 * Tests for issuer list merge + persistence helpers.
 * Run: pnpm --filter tap-app test:nav (includes this via test:utils) or node --import tsx --test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeIssuers } from "./myIssuers.js";

describe("mergeIssuers", () => {
	it("adds new server issuers without dropping local ones", () => {
		const existing = [
			{ _id: "a", legal_name: "Local A", deployed_to: "0x1", tx_hash: "0xt" },
		];
		const incoming = [
			{ _id: "b", legal_name: "Server B", deployed_to: "0x2", tx_hash: "0xu" },
		];
		const merged = mergeIssuers(existing, incoming);
		assert.equal(merged.length, 2);
		assert.ok(merged.some((i) => i._id === "a"));
		assert.ok(merged.some((i) => i._id === "b"));
	});

	it("fills missing contract from server without wiping name", () => {
		const existing = [
			{ _id: "a", legal_name: "Local Name", deployed_to: "", tx_hash: "" },
		];
		const incoming = [
			{ _id: "a", legal_name: "Cap Table", deployed_to: "0xabc", tx_hash: "0xtx" },
		];
		const merged = mergeIssuers(existing, incoming);
		assert.equal(merged.length, 1);
		assert.equal(merged[0].deployed_to, "0xabc");
		// Prefer non-empty legal_name; server generic "Cap Table" loses to Local Name
		assert.equal(merged[0].legal_name, "Local Name");
	});

	it("is idempotent when syncing the same list twice", () => {
		const once = mergeIssuers([], [
			{ _id: "x", legal_name: "X", deployed_to: "0x1", tx_hash: "" },
		]);
		const twice = mergeIssuers(once, [
			{ _id: "x", legal_name: "X", deployed_to: "0x1", tx_hash: "" },
		]);
		assert.equal(twice.length, 1);
		assert.equal(twice[0]._id, "x");
	});
});
