import styled from "styled-components";

const H1 = styled.h1`
	margin: 0 0 ${({ theme }) => theme.spacing.xl} 0;
	max-width: ${({ theme }) => theme.maxWidths.h1};
	font-size: ${({ theme }) => theme.fontSizes.H1};
	line-height: ${({ theme }) => theme.lineHeights.H1};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.04em;
	color: ${({ theme }) => theme.colors.text};
`;

const H2 = styled.h2`
	margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
	max-width: ${({ theme }) => theme.maxWidths.h1};
	font-size: ${({ theme }) => theme.fontSizes.H2};
	line-height: ${({ theme }) => theme.lineHeights.H2};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.03em;
	color: ${({ theme }) => theme.colors.text};
`;

const H3 = styled.h3`
	margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
	max-width: 40rem;
	font-size: ${({ theme }) => theme.fontSizes.H3};
	line-height: ${({ theme }) => theme.lineHeights.H3};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text};
`;

const Blockquote = styled.blockquote`
	margin: 0 0 ${({ theme }) => theme.spacing.xl} 0;
	padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
	max-width: 46rem;
	border-left: 2px solid ${({ theme }) => theme.colors.main};
	background: ${({ theme }) => theme.colors.accentMuted};
	border-radius: 0 ${({ theme }) => theme.radii.md} ${({ theme }) => theme.radii.md} 0;
	font-size: ${({ theme }) => theme.fontSizes.large};
	line-height: 1.55;
	color: ${({ theme }) => theme.colors.text};
`;

const P = styled.p`
	margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
	max-width: 40rem;
	font-size: ${({ theme }) => theme.fontSizes.medium};
	line-height: ${({ theme }) => theme.lineHeights.P};
	font-weight: ${({ theme }) => theme.fontWeights.normal};
	color: ${({ theme }) => theme.colors.muted};
	letter-spacing: -0.01em;

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
		font-size: ${({ theme }) => theme.fontSizes.baseline};
	}
`;

const Label = styled.label`
	display: inline-block;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
`;

const OrderedList = styled.ol`
	margin: ${({ theme }) => theme.spacing.lg} 0;
	padding-left: ${({ theme }) => theme.spacing.xl};
	font-size: ${({ theme }) => theme.fontSizes.medium};
	color: ${({ theme }) => theme.colors.muted};
`;

const Eyebrow = styled.span`
	display: inline-flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.main};
`;

export { H1, H2, H3, Blockquote, P, Label, OrderedList, Eyebrow };
