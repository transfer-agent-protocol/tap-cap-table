import styled from "styled-components";

/**
 * Typography — sans for UI copy, mono for data.
 * Text blocks cap at theme.maxWidths.text (~680px) for legibility.
 */

const H1 = styled.h1`
	margin: 0;
	max-width: ${({ theme }) => theme.maxWidths.text};
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.H1};
	line-height: ${({ theme }) => theme.lineHeights.H1};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.03em;
	color: ${({ theme }) => theme.colors.text};
`;

const H2 = styled.h2`
	margin: 0;
	max-width: ${({ theme }) => theme.maxWidths.text};
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.H2};
	line-height: ${({ theme }) => theme.lineHeights.H2};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text};
`;

const H3 = styled.h3`
	margin: 0;
	max-width: ${({ theme }) => theme.maxWidths.text};
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.H3};
	line-height: ${({ theme }) => theme.lineHeights.H3};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.01em;
	color: ${({ theme }) => theme.colors.text};
`;

const P = styled.p`
	margin: 0;
	max-width: ${({ theme }) => theme.maxWidths.text};
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.medium};
	line-height: ${({ theme }) => theme.lineHeights.P};
	font-weight: ${({ theme }) => theme.fontWeights.normal};
	color: ${({ theme }) => theme.colors.textMuted};

	@media (max-width: ${({ theme }) => theme.breakpoints.phone}) {
		font-size: ${({ theme }) => theme.fontSizes.baseline};
	}
`;

/** Uppercase micro-label for fields and table headers. */
const Label = styled.label`
	display: inline-block;
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.textSubtle};
`;

/** Accent kicker above a heading. */
const Eyebrow = styled.span`
	display: inline-flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.accent};
`;

/** Secondary explanatory copy. */
const MutedText = styled.p`
	margin: 0;
	max-width: ${({ theme }) => theme.maxWidths.text};
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.small};
	line-height: ${({ theme }) => theme.lineHeights.P};
	color: ${({ theme }) => theme.colors.textMuted};
`;

/** Data span — numbers, addresses, tx hashes. Always mono, tabular. */
const Mono = styled.span`
	font-family: ${({ theme }) => theme.fonts.mono};
	font-variant-numeric: tabular-nums;
	letter-spacing: 0;
`;

export { H1, H2, H3, P, Label, Eyebrow, MutedText, Mono };
