import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildOwnershipChart, formatPct, shouldShowSliceLabel } from "./ownershipModel.js";

describe("buildOwnershipChart", () => {
	it("builds class bands and slices for two holders one class", () => {
		const model = buildOwnershipChart({
			holdings: [
				{
					quantity: 1000000,
					stakeholder: { _id: "a", name: { legal_name: "Alex Palmer" } },
					stockClass: { _id: "c1", name: "Common Seed Series" },
				},
				{
					quantity: 100000,
					stakeholder: { _id: "b", name: { legal_name: "John Constantine" } },
					stockClass: { _id: "c1", name: "Common Seed Series" },
				},
			],
			stakeholders: [],
			stockClasses: [],
		});
		assert.ok(model);
		assert.equal(model!.total, 1100000);
		assert.equal(model!.classBands.length, 1);
		assert.equal(model!.classBands[0].stockClassName, "Common Seed Series");
		assert.equal(model!.slices.length, 2);
		assert.ok(model!.slices[0].pct > model!.slices[1].pct);
	});

	it("collapses many holders into Others", () => {
		const holdings = Array.from({ length: 12 }, (_, i) => ({
			quantity: 1000 - i * 10,
			stakeholder: { _id: `p${i}`, name: { legal_name: `Person ${i}` } },
			stockClass: { _id: "c1", name: "Common" },
		}));
		const model = buildOwnershipChart({ holdings }, [], { maxNamed: 4 });
		assert.ok(model);
		assert.ok(model!.slices.some((s) => s.isOther));
		assert.ok(model!.slices.length <= 5);
	});

	it("returns null when empty", () => {
		assert.equal(buildOwnershipChart({ holdings: [] }), null);
	});
});

describe("format helpers", () => {
	it("formats pct and label threshold", () => {
		assert.equal(formatPct(90.9), "91%");
		assert.equal(shouldShowSliceLabel(10), true);
		assert.equal(shouldShowSliceLabel(2), false);
	});
});
