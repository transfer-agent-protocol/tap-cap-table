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
 * Palette: top 8 holders by total shares get a distinct hue in rank order.
 * Everyone else (small shareholders, Others) always renders in neutral gray —
 * so adding 50 employee-option grants never reshuffles anyone's color.
 */
const PALETTE: readonly string[] = [
	"#c8f542", // rank 0 — lime (accent, biggest holder)
	"#5b8dee", // rank 1 — slate blue
	"#f0944d", // rank 2 — warm orange
	"#9b7fe8", // rank 3 — dusty violet
	"#3ecfb2", // rank 4 — teal
	"#f26c6c", // rank 5 — coral
	"#f5c542", // rank 6 — amber
	"#5bc4a1", // rank 7 — seafoam
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
	height: 100%;
`;

const BoxName = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	color: rgba(0, 0, 0, 0.82);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.3;
`;

const BoxMeta = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: rgba(0, 0, 0, 0.55);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.3;
`;

/** Show inline label if segment is wide enough for readable text. */
const MIN_LABEL_PCT = 5;

/**
 * $rank:
 *   0-7  = named holder, picks PALETTE[rank]
 *   -1   = minor/neutral (small shareholders, "Others") — uniform gray
 */
const HolderBox = styled.div<{ $pct: number; $rank: number }>`
	flex: 0 0 ${({ $pct }) => $pct}%;
	min-width: ${({ $pct }) => ($pct > 0 && $pct < 0.4 ? "2px" : undefined)};
	height: 100%;
	background: ${({ $rank }) => {
		if ($rank < 0) return "rgba(255, 255, 255, 0.12)"; // neutral gray for minor holders
		return PALETTE[$rank % PALETTE.length];
	}};
	position: relative;
	border-right: 1px solid rgba(0, 0, 0, 0.08);
	transition: filter ${({ theme }) => theme.transitions.default};
	cursor: default;

	&:hover {
		filter: brightness(1.08);
	}

	/* Show label only when segment is wide enough */
	${BoxLabel} {
		display: ${({ $pct }) => ($pct >= MIN_LABEL_PCT ? "flex" : "none")};
	}

	/* Narrow segments: tooltip above box on hover */
	&:hover::after {
		content: attr(data-label);
		display: ${({ $pct }) => ($pct < MIN_LABEL_PCT ? "block" : "none")};
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
		${({ theme }) => theme.colors.surface} 6px,
		${({ theme }) => theme.colors.surface} 7px
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

const Legend = styled.div`
	display: flex;
	flex-flow: row wrap;
	gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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
	max-width: 16rem;
`;

const Swatch = styled.span<{ $rank: number }>`
	width: 0.55rem;
	height: 0.55rem;
	flex-shrink: 0;
	background: ${({ $rank }) =>
		$rank >= 0 ? PALETTE[$rank % PALETTE.length] : "rgba(255, 255, 255, 0.2)"};
	border: 1px solid rgba(255, 255, 255, 0.12);
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

	// ── Rank holders by their TOTAL shares across all classes ──────────────
	// Biggest holder = rank 0 (lime). Rank drives both box order and color.
	// Small holders that don't earn a palette slot always get neutral gray,
	// so adding new employees never reshuffles existing colors.
	const totalByHolder = new Map<string, number>();
	for (const s of slices) {
		if (!s.isOther) {
			totalByHolder.set(
				s.shareholderId,
				(totalByHolder.get(s.shareholderId) ?? 0) + s.quantity,
			);
		}
	}

	const holderRank = new Map<string, number>();
	Array.from(totalByHolder.entries())
		.sort(([, a], [, b]) => b - a)
		.forEach(([id], rank) => holderRank.set(id, rank));

	// ── Sort slices: biggest holder first, their classes adjacent, Others last
	const orderedSlices = [...slices].sort((a, b) => {
		const rA = a.isOther ? 9999 : (holderRank.get(a.shareholderId) ?? 9999);
		const rB = b.isOther ? 9999 : (holderRank.get(b.shareholderId) ?? 9999);
		if (rA !== rB) return rA - rB;
		return b.quantity - a.quantity; // within a holder: larger class first
	});

	const rankOf = (s: (typeof slices)[number]): number => {
		if (s.isOther) return -1;
		const r = holderRank.get(s.shareholderId) ?? 9999;
		return r < PALETTE.length ? r : -1; // -1 = minor, renders neutral
	};

	// ── Legend: minor holders (<7% of issued) aggregated ──────────────────
	const LEGEND_MAX = 5;
	const minorByHolder = new Map<
		string,
		{
			shareholderId: string;
			shareholderName: string;
			classNames: string[];
			quantity: number;
			pctOfIssued: number;
			rank: number;
		}
	>();
	for (const s of orderedSlices) {
		if (shouldShowSliceLabel(s.pctOfIssued) && !s.isOther) continue;
		const prev = minorByHolder.get(s.shareholderId);
		const rank = rankOf(s);
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
				rank,
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

			<BoxRow
				role="img"
				aria-label={
					unissued
						? `Ownership of ${formatShares(barTotal)} authorized — ${formatShares(total)} issued`
						: `Ownership of ${formatShares(total)} issued shares`
				}
			>
				{orderedSlices.map((s) => {
					const rank = rankOf(s);
					return (
						<HolderBox
							key={s.key}
							$pct={s.pct}
							$rank={rank}
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
					);
				})}

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

			{legendEntries.length > 0 && (
				<Legend>
					{legendEntries.map((e) => (
						<LegendItem
							key={e.shareholderId}
							title={`${e.shareholderName} · ${e.classNames.join(", ")} · ${formatShares(e.quantity)} (${formatPct(e.pctOfIssued)} of issued)`}
						>
							<Swatch $rank={e.rank} />
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
							<Swatch $rank={-1} />
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
