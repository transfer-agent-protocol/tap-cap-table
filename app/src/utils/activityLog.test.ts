import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
	appendActivity,
	loadActivity,
	markActivityByTx,
	updateActivity,
	type ActivityEntry,
} from "./activityLog.js";

const mem = new Map<string, string>();

beforeEach(() => {
	mem.clear();
	(globalThis as any).window = {
		localStorage: {
			getItem: (k: string) => mem.get(k) ?? null,
			setItem: (k: string, v: string) => {
				mem.set(k, v);
			},
		},
	};
});

const base = (over: Partial<ActivityEntry> = {}): ActivityEntry => ({
	id: "1",
	issuerId: "iss",
	kind: "stock_issuance",
	type: "Stock issuance",
	details: "CS-1",
	quantity: "100",
	price: "1 USD",
	date: "2026-07-11",
	status: "pending",
	createdAt: Date.now(),
	...over,
});

describe("activityLog", () => {
	it("appends and loads by issuer", () => {
		appendActivity("iss", base({ id: "a", txHash: "0x1" }));
		appendActivity("iss", base({ id: "b", txHash: "0x2" }));
		const list = loadActivity("iss");
		assert.equal(list.length, 2);
		assert.equal(list[0].id, "b");
	});

	it("updates status by id and by tx hash", () => {
		appendActivity("iss", base({ id: "a", txHash: "0xabc" }));
		updateActivity("iss", "a", { status: "confirmed" });
		assert.equal(loadActivity("iss")[0].status, "confirmed");
		updateActivity("iss", "a", { status: "pending" });
		markActivityByTx("iss", "0xABC", "confirmed");
		assert.equal(loadActivity("iss")[0].status, "confirmed");
	});
});
