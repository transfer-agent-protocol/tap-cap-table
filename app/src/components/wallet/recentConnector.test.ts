/**
 * Run: pnpm --filter tap-app test:nav
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
	getRecentConnectorId,
	setRecentConnectorId,
	clearRecentConnectorId,
} from "./recentConnector.ts";

// Minimal localStorage polyfill for node:test
const store = new Map<string, string>();
(globalThis as any).window = {
	localStorage: {
		getItem: (k: string) => store.get(k) ?? null,
		setItem: (k: string, v: string) => {
			store.set(k, v);
		},
		removeItem: (k: string) => {
			store.delete(k);
		},
	},
};

describe("recentConnector", () => {
	beforeEach(() => {
		store.clear();
	});

	it("returns null when empty", () => {
		assert.equal(getRecentConnectorId(), null);
	});

	it("round-trips set/get", () => {
		setRecentConnectorId("io.rabby");
		assert.equal(getRecentConnectorId(), "io.rabby");
	});

	it("clears", () => {
		setRecentConnectorId("io.rabby");
		clearRecentConnectorId();
		assert.equal(getRecentConnectorId(), null);
	});
});
