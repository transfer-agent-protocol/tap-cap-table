/**
 * Build visual ownership segments from holdings + optimistic session issuances.
 */

export interface OwnershipSlice {
	key: string;
	shareholderId: string;
	shareholderName: string;
	stockClassId: string;
	stockClassName: string;
	quantity: number;
	/** 0–100 of the bar (authorized when known, else issued) — drives widths */
	pct: number;
	/** 0–100 of issued shares — the ownership number people mean */
	pctOfIssued: number;
	/** true if merged small holders */
	isOther?: boolean;
	otherCount?: number;
}

export interface OwnershipClassBand {
	stockClassId: string;
	stockClassName: string;
	quantity: number;
	pct: number;
	/** start offset 0–100 for label placement */
	startPct: number;
}

export interface OwnershipChartModel {
	/** Issued shares (sum of slices) */
	total: number;
	/** Denominator for widths: authorized when known, else issued */
	barTotal: number;
	slices: OwnershipSlice[];
	classBands: OwnershipClassBand[];
	/** Authorized-but-unissued remainder — only when authorized is provided */
	unissued?: { quantity: number; pct: number };
}

const MAX_NAMED_SLICES = 8;
/** Segments smaller than this % get name suppressed below the bar (still in title/tooltip). */
const MIN_LABEL_PCT = 7;

export function formatShares(n: number): string {
	if (!Number.isFinite(n)) return "—";
	return Math.round(n).toLocaleString("en-US");
}

export function formatPct(pct: number): string {
	if (!Number.isFinite(pct) || pct <= 0) return "0%";
	if (pct < 0.1) return "<0.1%";
	if (pct >= 10) return `${pct.toFixed(0)}%`;
	return `${pct.toFixed(1)}%`;
}

function personName(s: any): string {
	return s?.name?.legal_name || s?.name?.first_name || s?._id || "Shareholder";
}

function className(c: any): string {
	return c?.name || c?._id || "Class";
}

/**
 * @param maxNamed - max individual shareholder slices before "Others"
 */
export function buildOwnershipChart(
	holdingsData: any,
	createdIssuances: Array<{
		stakeholder_id: string;
		stock_class_id: string;
		quantity: string;
		stakeholder_name?: string;
		stock_class_name?: string;
		confirmed?: boolean;
		txHash?: string;
	}> = [],
	opts: { maxNamed?: number; authorized?: number } = {},
): OwnershipChartModel | null {
	const maxNamed = opts.maxNamed ?? MAX_NAMED_SLICES;
	const holdings: any[] = holdingsData?.holdings || [];
	const stakeholders = holdingsData?.stakeholders || [];
	const stockClasses = holdingsData?.stockClasses || [];

	// Aggregate quantity by shareholder+class
	const byKey = new Map<
		string,
		{
			shareholderId: string;
			shareholderName: string;
			stockClassId: string;
			stockClassName: string;
			quantity: number;
		}
	>();

	const add = (
		shareholderId: string,
		stockClassId: string,
		qty: number,
		sName?: string,
		cName?: string,
	) => {
		if (!Number.isFinite(qty) || qty <= 0) return;
		const key = `${shareholderId}|${stockClassId}`;
		const prev = byKey.get(key);
		if (prev) {
			prev.quantity += qty;
			return;
		}
		const sh = stakeholders.find((x: any) => x._id === shareholderId);
		const sc = stockClasses.find((x: any) => x._id === stockClassId);
		byKey.set(key, {
			shareholderId,
			shareholderName: sName || personName(sh),
			stockClassId,
			stockClassName: cName || className(sc),
			quantity: qty,
		});
	};

	for (const h of holdings) {
		add(
			h.stakeholder?._id,
			h.stockClass?._id,
			Number(h.quantity),
			personName(h.stakeholder),
			className(h.stockClass),
		);
	}

	const chainKeys = new Set(
		holdings.map((h) => `${h.stakeholder?._id}|${h.stockClass?._id}`),
	);
	for (const iss of createdIssuances) {
		const key = `${iss.stakeholder_id}|${iss.stock_class_id}`;
		if (chainKeys.has(key)) continue;
		// include pending + confirmed session rows until chain catches up
		add(
			iss.stakeholder_id,
			iss.stock_class_id,
			Number(iss.quantity),
			iss.stakeholder_name,
			iss.stock_class_name,
		);
	}

	const rows = Array.from(byKey.values()).filter((r) => r.quantity > 0);
	if (rows.length === 0) return null;

	const total = rows.reduce((s, r) => s + r.quantity, 0);
	if (total <= 0) return null;

	// When the authorization is known, the bar represents authorized capacity;
	// the tail past issued renders as an explicit "Unissued" segment.
	const authorized = Number(opts.authorized);
	const barTotal =
		Number.isFinite(authorized) && authorized > total ? authorized : total;

	// Class bands (across full bar)
	const classMap = new Map<string, { name: string; quantity: number }>();
	for (const r of rows) {
		const c = classMap.get(r.stockClassId) || { name: r.stockClassName, quantity: 0 };
		c.quantity += r.quantity;
		c.name = r.stockClassName || c.name;
		classMap.set(r.stockClassId, c);
	}
	// Stable order: largest class first
	const classList = Array.from(classMap.entries()).sort((a, b) => b[1].quantity - a[1].quantity);
	let classCursor = 0;
	const classBands: OwnershipClassBand[] = classList.map(([id, c]) => {
		const pct = (c.quantity / barTotal) * 100;
		const band = {
			stockClassId: id,
			stockClassName: c.name,
			quantity: c.quantity,
			pct,
			startPct: classCursor,
		};
		classCursor += pct;
		return band;
	});

	// Within each class, sort holders by size; collapse tail into Others
	const slices: OwnershipSlice[] = [];
	for (const [classId, cInfo] of classList) {
		const inClass = rows
			.filter((r) => r.stockClassId === classId)
			.sort((a, b) => b.quantity - a.quantity);

		// Budget named slices per class proportional-ish, at least 2, cap maxNamed total later
		const namedHere = Math.max(2, Math.ceil(maxNamed / classList.length));
		const head = inClass.slice(0, namedHere);
		const tail = inClass.slice(namedHere);

		for (const r of head) {
			slices.push({
				key: `${r.shareholderId}|${r.stockClassId}`,
				shareholderId: r.shareholderId,
				shareholderName: r.shareholderName,
				stockClassId: r.stockClassId,
				stockClassName: r.stockClassName,
				quantity: r.quantity,
				pct: (r.quantity / barTotal) * 100,
				pctOfIssued: (r.quantity / total) * 100,
			});
		}
		if (tail.length > 0) {
			const q = tail.reduce((s, r) => s + r.quantity, 0);
			slices.push({
				key: `other|${classId}`,
				shareholderId: `other-${classId}`,
				shareholderName: `Others (${tail.length})`,
				stockClassId: classId,
				stockClassName: cInfo.name,
				quantity: q,
				pct: (q / barTotal) * 100,
				pctOfIssued: (q / total) * 100,
				isOther: true,
				otherCount: tail.length,
			});
		}
	}

	// Re-order slices to match class band order left-to-right
	const ordered: OwnershipSlice[] = [];
	for (const band of classBands) {
		ordered.push(...slices.filter((s) => s.stockClassId === band.stockClassId));
	}

	const unissued =
		barTotal > total
			? { quantity: barTotal - total, pct: ((barTotal - total) / barTotal) * 100 }
			: undefined;

	return { total, barTotal, slices: ordered, classBands, unissued };
}

export function shouldShowSliceLabel(pct: number): boolean {
	return pct >= MIN_LABEL_PCT;
}
