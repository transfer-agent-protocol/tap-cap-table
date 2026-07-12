import styled from "styled-components";
import { MutedText } from "../typography";
import {
	buildOwnershipChart,
	formatPct,
	formatShares,
	shouldShowSliceLabel,
	type OwnershipChartModel,
} from "./ownershipModel";

const Wrap = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	padding: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.lg};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ClassRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	width: 100%;
	min-height: 1.25rem;
	position: relative;
`;

const ClassLabel = styled.div<{ $start: number; $width: number }>`
	position: absolute;
	left: ${({ $start }) => $start}%;
	width: ${({ $width }) => $width}%;
	padding: 0 0.15rem;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.textSubtle};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	box-sizing: border-box;
`;

const Bar = styled.div`
	display: flex;
	flex-flow: row nowrap;
	width: 100%;
	height: 1.75rem;
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
	/* overflow: visible so segment hover popovers can float above the bar */
	overflow: visible;
`;

/** Lime + muted greens on dark — accent leads, tones alternate for legibility. */
const SEGMENT_TONES = (theme: any): string[] => [
	theme.colors.accent,
	"rgba(200, 245, 66, 0.55)",
	"rgba(52, 211, 153, 0.75)",
	"rgba(200, 245, 66, 0.35)",
	"rgba(163, 230, 53, 0.65)",
	"rgba(74, 222, 128, 0.55)",
];

/**
 * Floating name popover that appears when hovering a segment — essential
 * when the bar segment is too narrow to display a permanent label beneath.
 * Must be declared BEFORE Seg so the `&:hover ${SegPopover}` selector works.
 */
const SegPopover = styled.div`
	position: absolute;
	bottom: calc(100% + 6px);
	left: 50%;
	transform: translateX(-50%);
	white-space: nowrap;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.borderStrong};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.text};
	font-family: ${({ theme }) => theme.fonts.sans};
	line-height: 1.5;
	opacity: 0;
	pointer-events: none;
	transition: opacity ${({ theme }) => theme.transitions.default};
	z-index: ${({ theme }) => theme.zIndices.dropdown};
`;

const Seg = styled.div<{ $pct: number; $tone: number; $isOther?: boolean }>`
	position: relative;
	flex: 0 0 ${({ $pct }) => $pct}%;
	max-width: ${({ $pct }) => $pct}%;
	height: 100%;
	box-sizing: border-box;
	border-right: 1px solid ${({ theme }) => theme.colors.background};
	background: ${({ theme, $tone, $isOther }) => {
		if ($isOther) return theme.colors.elevated;
		const tones = SEGMENT_TONES(theme);
		return tones[$tone % tones.length];
	}};
	opacity: 1;
	min-width: ${({ $pct }) => ($pct > 0 && $pct < 0.8 ? "2px" : undefined)};
	cursor: default;
	transition: filter ${({ theme }) => theme.transitions.default};

	&:hover {
		filter: brightness(1.08);
	}

	&:hover ${SegPopover} {
		opacity: 1;
	}

	&:last-child {
		border-right: none;
	}
`;

/** Authorized-but-unissued capacity — visibly empty, hatched. */
const UnissuedSeg = styled.div<{ $pct: number }>`
	flex: 0 0 ${({ $pct }) => $pct}%;
	max-width: ${({ $pct }) => $pct}%;
	height: 100%;
	box-sizing: border-box;
	background: repeating-linear-gradient(
		-45deg,
		transparent,
		transparent 6px,
		${({ theme }) => theme.colors.elevated} 6px,
		${({ theme }) => theme.colors.elevated} 7px
	);
	cursor: default;
`;

const HolderRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	width: 100%;
	position: relative;
	min-height: 2.5rem;
`;

const HolderLabel = styled.div<{ $start: number; $width: number }>`
	position: absolute;
	/* Clamp: a widened label near the right edge must not overflow the row */
	left: ${({ $start, $width }) => Math.min($start, 100 - Math.max($width, 8))}%;
	width: ${({ $width }) => Math.max($width, 8)}%;
	padding: 0.15rem 0.2rem 0;
	box-sizing: border-box;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	line-height: 1.3;
	color: ${({ theme }) => theme.colors.textMuted};
	/* center under segment when wide enough */
	text-align: ${({ $width }) => ($width >= 12 ? "center" : "left")};
	overflow: hidden;
`;

const Name = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	color: ${({ theme }) => theme.colors.text};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const Meta = styled.div`
	color: ${({ theme }) => theme.colors.textSubtle};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const Legend = styled.div`
	display: flex;
	flex-flow: row wrap;
	gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	margin-top: ${({ theme }) => theme.spacing.md};
	padding-top: ${({ theme }) => theme.spacing.sm};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const LegendItem = styled.div`
	display: inline-flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: 0.35rem;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.textMuted};
	max-width: 14rem;
`;

const Swatch = styled.span<{ $tone: number; $isOther?: boolean }>`
	width: 0.55rem;
	height: 0.55rem;
	flex-shrink: 0;
	background: ${({ theme, $tone, $isOther }) => {
		if ($isOther) return theme.colors.elevated;
		const tones = SEGMENT_TONES(theme);
		return tones[$tone % tones.length];
	}};
	border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TotalLine = styled(MutedText)`
	margin: 0;
	font-variant-numeric: tabular-nums;
`;

interface OwnershipBarProps {
	holdingsData: any;
	createdIssuances?: Array<{
		stakeholder_id: string;
		stock_class_id: string;
		quantity: string;
		stakeholder_name?: string;
		stock_class_name?: string;
		confirmed?: boolean;
		txHash?: string;
	}>;
	/** Issuer authorization — when provided, the bar shows unissued capacity too */
	authorized?: number;
}

function sliceTitle(s: {
	shareholderName: string;
	stockClassName: string;
	quantity: number;
	pct: number;
	pctOfIssued: number;
}): string {
	const ofAuthorized =
		Math.round(s.pct * 10) !== Math.round(s.pctOfIssued * 10)
			? ` · ${formatPct(s.pct)} of authorized`
			: "";
	return `${s.shareholderName} · ${s.stockClassName} · ${formatShares(s.quantity)} (${formatPct(s.pctOfIssued)} of issued${ofAuthorized})`;
}

export function OwnershipBar({
	holdingsData,
	createdIssuances = [],
	authorized,
}: OwnershipBarProps) {
	const model: OwnershipChartModel | null = buildOwnershipChart(
		holdingsData,
		createdIssuances,
		{ authorized },
	);
	if (!model) return null;

	const { total, barTotal, slices, classBands, unissued } = model;

	const MIN_BAR_PCT = 3; // segment must be at least 3% wide for readable permanent text

	// A slice gets a permanent label when the holder owns >= MIN_LABEL_PCT of
	// *issued* shares AND the bar segment is wide enough for readable text.
	// Significant holders with a narrow segment get a hover popover instead.
	const hasPermLabel = (s: (typeof slices)[number]) =>
		shouldShowSliceLabel(s.pctOfIssued) && s.pct >= MIN_BAR_PCT;

	// Legend entries: only truly minor holders (low ownership %).
	// Significant-but-narrow holders get hover popovers, not legend chips.
	const isMinorHolder = (s: (typeof slices)[number]) => !shouldShowSliceLabel(s.pctOfIssued);

	// Legend for slices too small to label under the bar — aggregated by
	// shareholder (one entry per person, classes joined), capped so 100
	// holders never produce 100 chips.
	const LEGEND_MAX = 5;
	const tinyByHolder = new Map<
		string,
		{
			shareholderId: string;
			shareholderName: string;
			classNames: string[];
			quantity: number;
			pctOfIssued: number;
			isOther?: boolean;
		}
	>();
	for (const s of slices) {
		if (!isMinorHolder(s)) continue; // significant holders: hover popover only, no legend chip
		const prev = tinyByHolder.get(s.shareholderId);
		if (prev) {
			prev.quantity += s.quantity;
			prev.pctOfIssued += s.pctOfIssued;
			if (!prev.classNames.includes(s.stockClassName)) prev.classNames.push(s.stockClassName);
		} else {
			tinyByHolder.set(s.shareholderId, {
				shareholderId: s.shareholderId,
				shareholderName: s.shareholderName,
				classNames: [s.stockClassName],
				quantity: s.quantity,
				pctOfIssued: s.pctOfIssued,
				isOther: s.isOther,
			});
		}
	}
	const tinyEntries = Array.from(tinyByHolder.values()).sort((a, b) => b.quantity - a.quantity);
	const legendEntries = tinyEntries.slice(0, LEGEND_MAX);
	const legendRest = tinyEntries.slice(LEGEND_MAX);
	const legendRestPct = legendRest.reduce((sum, e) => sum + e.pctOfIssued, 0);
	let cursor = 0;
	const starts = slices.map((s) => {
		const start = cursor;
		cursor += s.pct;
		return start;
	});

	// One tone per shareholder — the same person holding multiple stock
	// classes reads as one color across class bands.
	const toneByHolder = new Map<string, number>();
	for (const s of slices) {
		if (!s.isOther && !toneByHolder.has(s.shareholderId)) {
			toneByHolder.set(s.shareholderId, toneByHolder.size);
		}
	}
	const toneOf = (s: (typeof slices)[number]) => toneByHolder.get(s.shareholderId) ?? 0;

	return (
		<Wrap data-testid="ownership-bar">
			<TotalLine>
				{unissued
					? `Issued ${formatShares(total)} of ${formatShares(barTotal)} authorized shares`
					: `Issued ownership · ${formatShares(total)} shares`}
			</TotalLine>

			{/* Class labels above the bar */}
			<ClassRow aria-hidden={classBands.length === 0}>
				{classBands.map((b) => (
					<ClassLabel
						key={b.stockClassId}
						$start={b.startPct}
						$width={b.pct}
						title={`${b.stockClassName} · ${formatShares(b.quantity)} (${formatPct(b.pct)})`}
					>
						{b.pct >= 6 ? b.stockClassName : b.pct >= 3 ? b.stockClassName.slice(0, 8) : "·"}
					</ClassLabel>
				))}
			</ClassRow>

			{/* Filled bar (+ unissued capacity when authorization is known) */}
			<Bar
				role="img"
				aria-label={
					unissued
						? `Ownership of ${formatShares(barTotal)} authorized shares — ${formatShares(total)} issued`
						: `Ownership breakdown of ${formatShares(total)} issued shares`
				}
			>
				{slices.map((s) => (
					<Seg
						key={s.key}
						$pct={s.pct}
						$tone={toneOf(s)}
						$isOther={s.isOther}
						title={sliceTitle(s)}
					>
						{/* Hover popover — always available, essential when bar segment is narrow */}
						<SegPopover>
							{s.shareholderName}
							{!s.isOther && ` · ${s.stockClassName}`}
							{` · ${formatShares(s.quantity)} (${formatPct(s.pctOfIssued)})`}
						</SegPopover>
					</Seg>
				))}
				{unissued && (
					<UnissuedSeg
						$pct={unissued.pct}
						title={`Unissued · ${formatShares(unissued.quantity)} (${formatPct(unissued.pct)} of authorized)`}
					/>
				)}
			</Bar>

			{/* Shareholder names below — % of issued (ownership) */}
			<HolderRow>
				{slices.map((s, i) => {
					if (!hasPermLabel(s)) return null;
					return (
						<HolderLabel
							key={s.key}
							$start={starts[i]}
							$width={s.pct}
							title={sliceTitle(s)}
						>
							<Name>{s.shareholderName}</Name>
							<Meta>
								{formatPct(s.pctOfIssued)} · {formatShares(s.quantity)}
							</Meta>
						</HolderLabel>
					);
				})}
				{unissued && shouldShowSliceLabel(unissued.pct) && (
					<HolderLabel
						$start={100 - unissued.pct}
						$width={unissued.pct}
						title={`Unissued · ${formatShares(unissued.quantity)} (${formatPct(unissued.pct)} of authorized)`}
					>
						<Name>Unissued</Name>
						<Meta>
							{formatPct(unissued.pct)} of authorized · {formatShares(unissued.quantity)}
						</Meta>
					</HolderLabel>
				)}
			</HolderRow>

			{/* Legend for slices too narrow to label under the bar */}
			{legendEntries.length > 0 && (
				<Legend>
					{legendEntries.map((e) => (
						<LegendItem
							key={e.shareholderId}
							title={`${e.shareholderName} · ${e.classNames.join(", ")} · ${formatShares(e.quantity)} (${formatPct(e.pctOfIssued)} of issued)`}
						>
							<Swatch
								$tone={toneByHolder.get(e.shareholderId) ?? 0}
								$isOther={e.isOther}
							/>
							<span>
								{e.shareholderName} · {formatPct(e.pctOfIssued)}
							</span>
						</LegendItem>
					))}
					{legendRest.length > 0 && (
						<LegendItem
							title={legendRest.map((e) => e.shareholderName).join(", ")}
							data-testid="legend-more"
						>
							<Swatch $tone={0} $isOther />
							<span>
								+ {legendRest.length} more · {formatPct(legendRestPct)} of issued
							</span>
						</LegendItem>
					)}
				</Legend>
			)}
		</Wrap>
	);
}
