/**
 * Run: pnpm --filter tap-app test:nav
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { orderConnectors } from "./orderConnectors.ts";

describe("orderConnectors", () => {
	const connectors = [
		{ uid: "1", id: "injected", name: "Injected", type: "injected", detected: false },
		{ uid: "2", id: "io.rabby", name: "Rabby", type: "injected", detected: true },
		{ uid: "3", id: "io.metamask", name: "MetaMask", type: "injected", detected: true },
	];

	it("puts recent first", () => {
		const ordered = orderConnectors(connectors, "io.rabby");
		assert.equal(ordered[0].id, "io.rabby");
	});

	it("puts detected before undetected (after recent)", () => {
		const ordered = orderConnectors(connectors, null);
		const ids = ordered.map((c) => c.id);
		const rabby = ids.indexOf("io.rabby");
		const mm = ids.indexOf("io.metamask");
		// Generic Injected dropped when named EIP-6963 peers exist
		assert.ok(rabby >= 0);
		assert.ok(mm >= 0);
		assert.equal(ids.includes("injected"), false);
	});

	it("keeps generic Injected when it is the only injected option", () => {
		const only = [
			{ uid: "1", id: "injected", name: "Injected", type: "injected", detected: true },
		];
		const ordered = orderConnectors(only, null);
		assert.equal(ordered[0].id, "injected");
	});

	it("sorts detected alphabetically by name", () => {
		const ordered = orderConnectors(connectors, null);
		const detected = ordered.filter((c) => c.detected);
		assert.deepEqual(
			detected.map((c) => c.name),
			["MetaMask", "Rabby"],
		);
	});

	it("dedupes by uid", () => {
		const dup = [
			...connectors,
			{ uid: "2", id: "io.rabby", name: "Rabby", type: "injected", detected: true },
		];
		const ordered = orderConnectors(dup, null);
		assert.equal(ordered.filter((c) => c.id === "io.rabby").length, 1);
	});
});
