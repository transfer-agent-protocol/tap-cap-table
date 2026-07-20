import styled, { css } from "styled-components";

/**
 * Elements — interactive and surface primitives.
 * One Button. Variants change intent, sizes change footprint — nothing else.
 */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "md" | "lg";

const Button = styled.button<{ $variant?: ButtonVariant; $size?: ButtonSize; $block?: boolean }>`
	display: inline-flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing.sm};
	width: ${({ $block }) => ($block ? "100%" : "auto")};
	height: ${({ $size = "md" }) => ($size === "lg" ? "2.75rem" : "2.25rem")};
	padding: 0 ${({ theme, $size = "md" }) => ($size === "lg" ? theme.spacing.xl : theme.spacing.md)};
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme, $size = "md" }) =>
		$size === "lg" ? theme.fontSizes.baseline : theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.01em;
	white-space: nowrap;
	border: 1px solid transparent;
	cursor: pointer;
	text-decoration: none !important;
	transition: background ${({ theme }) => theme.transitions.default},
		border-color ${({ theme }) => theme.transitions.default},
		color ${({ theme }) => theme.transitions.default},
		opacity ${({ theme }) => theme.transitions.default};

	&:disabled {
		cursor: not-allowed;
		background: ${({ theme }) => theme.colors.elevated};
		color: ${({ theme }) => theme.colors.textSubtle} !important;
		border-color: ${({ theme }) => theme.colors.border};
	}

	${({ theme, $variant = "secondary" }) => {
		if ($variant === "primary") {
			// !important guards against global `a {}` color on link-shaped buttons
			return css`
				background: ${theme.colors.accent};
				color: ${theme.colors.onAccent} !important;
				border-color: ${theme.colors.accent};

				&:hover:not(:disabled),
				&:focus-visible:not(:disabled) {
					opacity: 0.92;
				}
			`;
		}
		if ($variant === "danger") {
			return css`
				background: transparent;
				color: ${theme.colors.error};
				border-color: ${theme.colors.errorBg};

				&:hover:not(:disabled),
				&:focus-visible:not(:disabled) {
					background: ${theme.colors.errorBg};
					border-color: ${theme.colors.error};
				}
			`;
		}
		if ($variant === "ghost") {
			return css`
				background: transparent;
				color: ${theme.colors.textMuted};
				border-color: transparent;

				&:hover:not(:disabled),
				&:focus-visible:not(:disabled) {
					color: ${theme.colors.text};
					background: ${theme.colors.elevated};
				}
			`;
		}
		// secondary
		return css`
			background: transparent;
			color: ${theme.colors.text};
			border-color: ${theme.colors.borderStrong};

			&:hover:not(:disabled),
			&:focus-visible:not(:disabled) {
				border-color: ${theme.colors.accent};
				color: ${theme.colors.accent};
				background: ${theme.colors.accentMuted};
			}
		`;
	}}
`;

/** Bordered surface box. */
const Panel = styled.section`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	min-width: 0;
	padding: ${({ theme }) => theme.spacing.lg};
	background: transparent;
	border: 1px solid ${({ theme }) => theme.colors.border};
`;

/** Inline feedback for success / error / pending outcomes. */
const StatusMessage = styled.div<{ $variant?: "success" | "error" | "pending" }>`
	padding: ${({ theme }) => theme.spacing.sm} 0 ${({ theme }) => theme.spacing.sm}
		${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.fontSizes.small};
	word-break: break-word;
	line-height: ${({ theme }) => theme.lineHeights.P};
	border-left: 2px solid
		${({ theme, $variant = "pending" }) => theme.colors[$variant]};
	color: ${({ theme, $variant = "pending" }) => theme.colors[$variant]};
`;

/** Scroll frame for tables — hairline border, sticky-header friendly. */
const TableFrame = styled.div`
	width: 100%;
	overflow-x: auto;
	overflow-y: auto;
	max-height: min(70vh, 40rem);
	border: 1px solid ${({ theme }) => theme.colors.border};
	background: ${({ theme }) => theme.colors.background};
`;

/** Ledger table — mono tabular data, uppercase sans headers. */
const Table = styled.table`
	width: 100%;
	min-width: 36rem;
	border-collapse: separate;
	border-spacing: 0;
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	table-layout: auto;

	th,
	td {
		text-align: left;
		padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
		border-bottom: 1px solid ${({ theme }) => theme.colors.border};
		vertical-align: middle;
		word-break: break-word;
	}

	th {
		background: ${({ theme }) => theme.colors.elevated};
		color: ${({ theme }) => theme.colors.textSubtle};
		font-size: ${({ theme }) => theme.fontSizes.xs};
		font-weight: ${({ theme }) => theme.fontWeights.semibold};
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
		border-bottom: 1px solid ${({ theme }) => theme.colors.borderStrong};
	}

	thead th {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	td {
		color: ${({ theme }) => theme.colors.text};
		font-family: ${({ theme }) => theme.fonts.mono};
		font-variant-numeric: tabular-nums;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr:hover td {
		background: ${({ theme }) => theme.colors.surface};
	}

	td a {
		color: ${({ theme }) => theme.colors.accent};
		text-decoration: none;
		font-weight: ${({ theme }) => theme.fontWeights.medium};

		&:hover {
			text-decoration: underline;
		}
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		font-size: ${({ theme }) => theme.fontSizes.xs};
		min-width: 28rem;

		th,
		td {
			padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
		}
	}
`;

/** Key figures band. */
const StatGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
	gap: ${({ theme }) => theme.spacing.sm};
	width: 100%;
`;

const StatCard = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
	padding: ${({ theme }) => theme.spacing.md} 0;
	border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatLabel = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.textSubtle};
`;

const StatValue = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.H3};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	color: ${({ theme }) => theme.colors.text};
	font-family: ${({ theme }) => theme.fonts.mono};
	font-variant-numeric: tabular-nums;
`;

const Divider = styled.hr`
	width: 100%;
	border: none;
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	margin: ${({ theme }) => theme.spacing.sm} 0;
`;

/** Raw response / hash block — mono, selectable. */
const ResponseBlock = styled.pre`
	padding: 0;
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-family: ${({ theme }) => theme.fonts.mono};
	background: transparent;
	border: none;
	color: ${({ theme }) => theme.colors.textMuted};
	word-break: break-all;
	white-space: pre-wrap;
	overflow-x: auto;
	user-select: all;
`;

export {
	Button,
	Panel,
	StatusMessage,
	Table,
	TableFrame,
	StatGrid,
	StatCard,
	StatLabel,
	StatValue,
	Divider,
	ResponseBlock,
};
export type { ButtonVariant, ButtonSize };
