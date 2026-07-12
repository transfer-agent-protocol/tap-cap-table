import styled from "styled-components";
import {
	buildOwnershipChart,
	formatPct,
	formatShares,
	shouldShowSliceLabel,
	type OwnershipChartModel,
} from "./ownershipModel";
import { MutedText } from "../typography";

/**
 * Distinct hue palette — each holder reads as its own person at a glance.
 * Tone 0 = accent (lime) for the biggest holder; remaining tones span
 * clearly different hues: blue, orange, violet, teal, coral, amber.
 * "Others" collapsed slices always use the elevated neutral tone.
 */
const PALETTE: string[] = [
	"#c8f542", // lime (accent)
	"#5b8dee", // slate blue
	"#f0944d", // warm orange
	"#9b7fe8", // dusty violet
	"#3ecfb2", // teal
	"#f26c6c", // coral
	"#f5c542", // amber
	"#5bc4a1", // seafoam
];

const Wrap = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	padding: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.lg};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const BoxRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	width: 100%;
	height: 5rem;
	gap: 1px;
	border: 1px solid ${({ theme }) => theme.colors.border};
	overflow: hidden;
`;

const BoxLabel = styled.div`
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-end;
	padding: ${({ theme }) => theme.spacing.sm};
	overflow: hidden;
	pointer-events: none;
`;

const BoxName = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	color: ${({ theme }) => theme.colors.inverse};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.3;
`;

const BoxMeta = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: rgba(0, 0, 0, 0.65);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.3;
`;

/** Minimum segment width (% of total) to show inline text. */
const MIN_LABEL_PCT = 4;

const HolderBox = styled.div<{ $pct: number; $tone: number; $isOther?: boolean }>`
	flex: 0 0 ${({ $pct }) => $pct}%;
	min-width: ${({ $pct }) => ($pct > 0 && $pct < 0.5 ? "2px" : undefined)};
	height: 100%;
	background: ${({ theme, $tone, $isOther }) => {
		if ($isOther) return theme.colors.elevated;
		return PALETTE[$tone % PALETTE.length];
	}};
	position: relative;
	transition: filter ${({ theme }) => theme.transitions.default};
	cursor: default;

	&:hover {
		filter: brightness(1.1);
	}

	/* Show label only when wide enough */
	${BoxLabel} {
		display: ${({ $pct }) => ($pct >= MIN_LABEL_PCT ? "flex" : "none")};
	}

	/* Narrow segments: floating tooltip on hover via ::after */
	&[title]:hover::after {
		content: attr(data-label);
		position: absolute;
		bottom: calc(100% + 4px);
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		padding: 3px 8px;
		background: ${({ theme }) => theme.colors.background};
		border: 1px solid ${({ theme }) => theme.colors.borderStrong};
		font-size: ${({ theme }) => theme.fontSizes.xs};
		color: ${({ theme }) => theme.colors.text};
		z-index: ${({ theme }) => theme.zIndices.dropdown};
		pointer-events: none;
		display: ${({ $pct }) => ($pct < MIN_LABEL_PCT ? "block" : "none")};
	}
`;

const UnissuedBox = styled.div<{ $pct: number }>`
	flex: 0 0 ${({ $pct }) => $pct}%;
	height: 100%;
	position: relative;
	cursor: default;
	background: repeating-linear-gradient(
		-45deg,
		transparent,
		transparent 6px,
		${({ theme }) => theme.colors.elevated} 6px,
		${({ theme }) => theme.colors.elevated} 7px
	);

	${BoxLabel} {
		display: ${({ $pct }) => ($pct >= MIN_LABEL_PCT ? "flex" : "none")};
	}
`;

const UnissuedName = styled(BoxName)`
	color: ${({ theme }) => theme.colors.textSubtle};
`;

const UnissuedMeta = styled(BoxMeta)`
	color: ${({ theme }) => theme.colors.textSubtle};
`;

/** Small legend for holders too narrow to show inside their box. */
const Legend = styled.div`
	display: flex;
	flex-flow: row wrap;
	gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	margin-top: ${({ theme }) => theme.spacing.xs};
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
		return PALETTE[$tone % PALETTE.length];
	}};
	border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TotalLine = styled(MutedText)`
	margin: 0;
	font-variant-numeric: tabular-nums;
`;

interface OwnershipBoxesProps {
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
	/** Issuer authorization — when provided, the chart shows unissued capacity. */
	authorized?: number;
}

export function OwnershipBoxes({
	holdingsData,
	createdIssuances = [],
	authorized,
}: OwnershipBoxesProps) {
	const model: OwnershipChartModel | null = buildOwnershipChart(
		holdingsData,
		createdIssuances,
		{ authorized },
	);
	if (!model) return null;

	const { total, barTotal, slices, unissued } = model;

	// One tone per shareholder — consistent across all classes they hold.
	const toneByHolder = new Map<string, number>();
	for (const s of slices) {
		if (!s.isOther && !toneByHolder.has(s.shareholderId)) {
			toneByHolder.set(s.shareholderId, toneByHolder.size);
		}
	}
	const toneOf = (s: (typeof slices)[number]) => toneByHolder.get(s.shareholderId) ?? 0;

	// Legend: only truly minor holders (<7% of issued).
	const LEGEND_MAX = 5;
	const minorByHolder = new Map<
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
		if (shouldShowSliceLabel(s.pctOfIssued)) continue;
		const prev = minorByHolder.get(s.shareholderId);
		if (prev) {
			prev.quantity += s.quantity;
			prev.pctOfIssued += s.pctOfIssued;
			if (!prev.classNames.includes(s.stockClassName)) prev.classNames.push(s.stockClassName);
		} else {
			minorByHolder.set(s.shareholderId, {
				shareholderId: s.shareholderId,
				shareholderName: s.shareholderName,
				classNames: [s.stockClassName],
				quantity: s.quantity,
				pctOfIssued: s.pctOfIssued,
				isOther: s.isOther,
			});
		}
	}
	const sorted = Array.from(minorByHolder.values()).sort((a, b) => b.quantity - a.quantity);
	const legendEntries = sorted.slice(0, LEGEND_MAX);
	const legendRest = sorted.slice(LEGEND_MAX);
	const legendRestPct = legendRest.reduce((sum, e) => sum + e.pctOfIssued, 0);

	return (
		<Wrap data-testid="ownership-boxes">
			<TotalLine>
				{unissued
					? `Issued ${formatShares(total)} of ${formatShares(barTotal)} authorized shares`
					: `Issued ownership · ${formatShares(total)} shares`}
			</TotalLine>

			{/* Proportional box chart — class names live inside each box */}
			<BoxRow
				role="img"
				aria-label={
					unissued
						? `Ownership of ${formatShares(barTotal)} authorized — ${formatShares(total)} issued`
						: `Ownership of ${formatShares(total)} issued shares`
				}
			>
				{slices.map((s) => (
					<HolderBox
						key={s.key}
						$pct={s.pct}
						$tone={toneOf(s)}
						$isOther={s.isOther}
						title={`${s.shareholderName} · ${s.stockClassName} · ${formatShares(s.quantity)} (${formatPct(s.pctOfIssued)} of issued)`}
						data-label={`${s.shareholderName} · ${s.stockClassName} · ${formatPct(s.pctOfIssued)}`}
					>
						<BoxLabel>
							<BoxName>
								{s.isOther ? `Others (${s.otherCount ?? ""})` : s.shareholderName}
							</BoxName>
							<BoxMeta>
								{s.stockClassName} · {formatPct(s.pctOfIssued)}
							</BoxMeta>
						</BoxLabel>
					</HolderBox>
				))}

				{unissued && (
					<UnissuedBox
						$pct={unissued.pct}
						title={`Unissued · ${formatShares(unissued.quantity)} (${formatPct(unissued.pct)} of authorized)`}
					>
						<BoxLabel>
							<UnissuedName>Unissued</UnissuedName>
							<UnissuedMeta>
								{formatPct(unissued.pct)} · {formatShares(unissued.quantity)}
							</UnissuedMeta>
						</BoxLabel>
					</UnissuedBox>
				)}
			</BoxRow>

			{/* Compact legend for minor holders */}
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
								{e.shareholderName} · {e.classNames.join(", ")} · {formatPct(e.pctOfIssued)}
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
