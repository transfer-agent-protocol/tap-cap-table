import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { holdingStatusForIssuance, issuanceStillSyncing } from "./holdingStatus.js";

describe("holdingStatusForIssuance", () => {
	it("is Pending with no receipt", () => {
		assert.equal(holdingStatusForIssuance({}), "Pending");
		assert.equal(holdingStatusForIssuance({ txHash: null }), "Pending");
	});

	it("is Confirmed once txHash or confirmed flag is set", () => {
		assert.equal(holdingStatusForIssuance({ txHash: "0xabc" }), "Confirmed");
		assert.equal(holdingStatusForIssuance({ confirmed: true }), "Confirmed");
	});
});

describe("issuanceStillSyncing", () => {
	const keySet = new Set(["a|b"]);

	it("false when onchain holdings already include the pair", () => {
		assert.equal(
			issuanceStillSyncing({ stakeholder_id: "a", stock_class_id: "b" }, keySet),
			false,
		);
	});

	it("false when wallet receipt already confirmed", () => {
		assert.equal(
			issuanceStillSyncing(
				{ stakeholder_id: "x", stock_class_id: "y", txHash: "0x1" },
				new Set(),
			),
			false,
		);
	});

	it("true only while waiting on a receipt", () => {
		assert.equal(
			issuanceStillSyncing({ stakeholder_id: "x", stock_class_id: "y" }, new Set()),
			true,
		);
	});
});
