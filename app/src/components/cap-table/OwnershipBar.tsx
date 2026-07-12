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
	overflow: hidden;
`;

/** Rust + monochrome ramp — accent leads, grays alternate for legibility. */
const SEGMENT_TONES = (theme: any): string[] => [
	theme.colors.accent,
	"rgba(255, 255, 255, 0.45)",
	"rgba(217, 95, 51, 0.55)",
	"rgba(255, 255, 255, 0.25)",
	"rgba(217, 95, 51, 0.3)",
	"rgba(255, 255, 255, 0.6)",
];

const Seg = styled.div<{ $pct: number; $tone: number; $isOther?: boolean }>`
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

	&:last-child {
		border-right: none;
	}
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
	left: ${({ $start }) => $start}%;
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
	margin-top: ${({ theme }) => theme.spacing.xs};
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
}

function sliceTitle(s: {
	shareholderName: string;
	stockClassName: string;
	quantity: number;
	pct: number;
}): string {
	return `${s.shareholderName} · ${s.stockClassName} · ${formatShares(s.quantity)} (${formatPct(s.pct)})`;
}

export function OwnershipBar({ holdingsData, createdIssuances = [] }: OwnershipBarProps) {
	const model: OwnershipChartModel | null = buildOwnershipChart(
		holdingsData,
		createdIssuances,
	);
	if (!model) return null;

	const { total, slices, classBands } = model;
	const tiny = slices.filter((s) => !shouldShowSliceLabel(s.pct));
	let cursor = 0;
	const starts = slices.map((s) => {
		const start = cursor;
		cursor += s.pct;
		return start;
	});

	return (
		<Wrap data-testid="ownership-bar">
			<TotalLine>
				Issued ownership · {formatShares(total)} shares
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

			{/* Filled bar */}
			<Bar role="img" aria-label={`Ownership breakdown of ${formatShares(total)} issued shares`}>
				{slices.map((s, i) => (
					<Seg
						key={s.key}
						$pct={s.pct}
						$tone={i}
						$isOther={s.isOther}
						title={sliceTitle(s)}
					/>
				))}
			</Bar>

			{/* Shareholder names below */}
			<HolderRow>
				{slices.map((s, i) => {
					if (!shouldShowSliceLabel(s.pct)) return null;
					return (
						<HolderLabel
							key={s.key}
							$start={starts[i]}
							$width={s.pct}
							title={sliceTitle(s)}
						>
							<Name>{s.shareholderName}</Name>
							<Meta>
								{formatPct(s.pct)} · {formatShares(s.quantity)}
							</Meta>
						</HolderLabel>
					);
				})}
			</HolderRow>

			{/* Legend for slices too narrow to label under the bar */}
			{tiny.length > 0 && (
				<Legend>
					{tiny.map((s, i) => {
						const tone = slices.findIndex((x) => x.key === s.key);
						return (
							<LegendItem key={s.key} title={sliceTitle(s)}>
								<Swatch $tone={tone >= 0 ? tone : i} $isOther={s.isOther} />
								<span>
									{s.shareholderName} · {formatPct(s.pct)}
								</span>
							</LegendItem>
						);
					})}
				</Legend>
			)}
		</Wrap>
	);
}
