import styled from "styled-components";

const FullWidth = styled.div`
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	align-items: stretch;
	width: 100%;
`;

const Nav = styled.nav`
	position: sticky;
	top: 0;
	z-index: ${({ theme }) => theme.zIndices.sticky};
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	min-height: ${({ theme }) => theme.layout.topBar};
	padding: 0 ${({ theme }) => theme.spacing.xl};
	box-sizing: border-box;
	background: rgba(9, 9, 11, 0.78);
	backdrop-filter: blur(16px) saturate(1.2);
	-webkit-backdrop-filter: blur(16px) saturate(1.2);
	border-bottom: 1px solid ${({ theme }) => theme.colors.outline};

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: 0 ${({ theme }) => theme.spacing.md};
	}
`;

const NavBrand = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	min-width: 0;
`;

const NavTitle = styled.h1`
	margin: 0;
	color: ${({ theme }) => theme.colors.text};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	line-height: 1.2;
	letter-spacing: -0.02em;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
		font-size: ${({ theme }) => theme.fontSizes.small};
	}
`;

const Logotype = styled.span`
	display: flex;
	flex-flow: row wrap;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	color: ${({ theme }) => theme.colors.text};
`;

const Main = styled.main`
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
	justify-content: flex-start;
	width: 100%;
	max-width: ${({ theme }) => theme.maxWidths.content};
	padding: ${({ theme }) => theme.spacing["2xl"]} ${({ theme }) => theme.spacing.xl};
	box-sizing: border-box;

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
	}

	mark {
		color: ${({ theme }) => theme.colors.inverse};
		background-color: ${({ theme }) => theme.colors.main};
		font-weight: ${({ theme }) => theme.fontWeights.medium};
		padding: 0 0.2em;
		border-radius: 2px;
	}
`;

const Heading = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: flex-start;
	justify-content: flex-start;
	gap: ${({ theme }) => theme.spacing.md};
	margin: 0 0 ${({ theme }) => theme.spacing["2xl"]} 0;
	max-width: 44rem;

	a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: ${({ theme }) => theme.fontSizes.baseline};
		font-weight: ${({ theme }) => theme.fontWeights.semibold};
		color: ${({ theme }) => theme.colors.main};
		border-bottom: 1px solid transparent;
		transition: border-color ${({ theme }) => theme.transitions.default};

		&:hover {
			border-bottom-color: ${({ theme }) => theme.colors.main};
			color: ${({ theme }) => theme.colors.main};
			background: transparent;
		}
	}
`;

const Content = styled.div`
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
	justify-content: flex-start;
	width: 100%;
`;

const Article = styled.article`
	display: flex;
	flex-flow: column nowrap;
	align-items: flex-start;
	width: 100%;
	max-width: ${({ theme }) => theme.maxWidths.article};
	text-align: left;
`;

const Credits = styled.div`
	display: flex;
	flex-flow: row nowrap;
	font-size: ${({ theme }) => theme.fontSizes.large};
	margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
	color: ${({ theme }) => theme.colors.muted};
`;

const StyledTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	table-layout: fixed;
	background: transparent;
	border-top: 1px solid ${({ theme }) => theme.colors.outline};

	th,
	td {
		text-align: left;
		padding: 0.75rem 0;
		border-bottom: 1px solid ${({ theme }) => theme.colors.outline};
		word-break: break-word;
		vertical-align: top;
	}

	th {
		background: transparent;
		color: ${({ theme }) => theme.colors.subtle};
		font-size: ${({ theme }) => theme.fontSizes.xs};
		font-weight: ${({ theme }) => theme.fontWeights.medium};
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding-bottom: 0.5rem;
	}

	tbody tr:hover td {
		color: ${({ theme }) => theme.colors.text};
	}

	td {
		color: ${({ theme }) => theme.colors.muted};
	}

	td a {
		color: ${({ theme }) => theme.colors.main};
		text-decoration: none;
		font-weight: ${({ theme }) => theme.fontWeights.medium};

		&:hover {
			text-decoration: underline;
			background: transparent;
		}
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		font-size: ${({ theme }) => theme.fontSizes.xs};
	}
`;

const FooterWrapper = styled.footer`
	display: flex;
	flex-flow: column nowrap;
	flex-shrink: 0;
	align-items: stretch;
	justify-content: flex-start;
	width: 100%;
	margin-top: auto;
	padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	box-sizing: border-box;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: ${({ theme }) => theme.spacing.md};
	}
`;

const FooterContent = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};

	a {
		color: ${({ theme }) => theme.colors.subtle} !important;
		text-decoration: none !important;
		opacity: 1 !important;
		letter-spacing: 0.06em;

		&:hover {
			color: ${({ theme }) => theme.colors.main} !important;
			text-decoration: none !important;
		}
	}
`;

const FooterAside = styled.aside`
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-end;
	width: 100%;
	margin: 0;

	p {
		font-size: ${({ theme }) => theme.fontSizes.small};
		margin: 0;
		color: ${({ theme }) => theme.colors.muted};
	}
`;

const MintLayout = styled.div`
	display: flex;
	flex-flow: row nowrap;
	gap: ${({ theme }) => theme.spacing.xl};
	width: 100%;
	margin-top: ${({ theme }) => theme.spacing.lg};
	align-items: flex-start;

	& > *:first-child {
		flex: 2;
	}
	& > *:last-child {
		flex: 1;
	}

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.mintCollapse}) {
		flex-flow: column nowrap;

		& > *:first-child,
		& > *:last-child {
			flex: 1;
		}
	}
`;

const Panel = styled.section`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	min-width: 0;
	padding: ${({ theme }) => theme.spacing.lg};
	background: transparent;
	border: 1px solid ${({ theme }) => theme.colors.outline};
`;

const StatusBox = styled.div<{ $variant?: "success" | "error" | "pending" }>`
	padding: ${({ theme }) => theme.spacing.sm} 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	word-break: break-word;
	line-height: 1.5;
	border: none;
	border-left: 2px solid
		${({ theme, $variant }) =>
			$variant === "success"
				? theme.colors.success
				: $variant === "error"
					? theme.colors.error
					: theme.colors.pending};
	padding-left: ${({ theme }) => theme.spacing.md};
	background: transparent;
	color: ${({ theme, $variant }) =>
		$variant === "success"
			? theme.colors.success
			: $variant === "error"
				? theme.colors.error
				: theme.colors.pending};
`;

const ResponseBlock = styled.pre`
	padding: 0;
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-family: inherit;
	background: transparent;
	border: none;
	color: ${({ theme }) => theme.colors.muted};
	word-break: break-all;
	white-space: pre-wrap;
	overflow-x: auto;
	user-select: all;
`;

const FullScreenMain = styled.div`
	display: flex;
	flex-flow: column nowrap;
	width: 100%;
	min-height: calc(100vh - ${({ theme }) => theme.layout.topBar} - 4rem);
	padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
	box-sizing: border-box;

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: ${({ theme }) => theme.spacing.md};
	}
`;

const FullScreenStack = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.lg};
	width: 100%;
	max-width: ${({ theme }) => theme.maxWidths.wide};
`;

const PageIntro = styled.section`
	display: flex;
	flex-flow: column nowrap;
	align-items: flex-start;
	gap: ${({ theme }) => theme.spacing.sm};
	max-width: 40rem;

	p {
		margin-bottom: 0;
	}
`;

const ActionTableLayout = styled.div`
	display: grid;
	grid-template-columns: minmax(18rem, 26rem) minmax(0, 1fr);
	gap: ${({ theme }) => theme.spacing.lg};
	align-items: start;
	width: 100%;

	@media (max-width: ${({ theme }) => theme.breakpoints.mintCollapse}) {
		grid-template-columns: 1fr;
	}
`;

/** Full-width manage page: form band then table band */
const PageLayout = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xl};
	width: 100%;
	max-width: ${({ theme }) => theme.maxWidths.wide};
`;

const FormBand = styled.section`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	max-width: 36rem;
	padding-bottom: ${({ theme }) => theme.spacing.lg};
	border-bottom: 1px solid ${({ theme }) => theme.colors.outline};
`;

const DataBand = styled.section`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
`;

const DashboardHeader = styled.header`
	display: flex;
	flex-flow: row wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing.md};
	padding: 0 0 ${({ theme }) => theme.spacing.lg} 0;
	border-bottom: 1px solid ${({ theme }) => theme.colors.outline};
	background: transparent;
`;

const DashboardGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 2fr;
	gap: ${({ theme }) => theme.spacing.xl};

	@media (max-width: ${({ theme }) => theme.breakpoints.mintCollapse}) {
		grid-template-columns: 1fr;
	}
`;

const FormPanel = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	min-width: 0;
`;

const TablePanel = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	min-width: 0;
	padding: 0;
	background: transparent;
	border: none;
`;

const TableTitle = styled.h3`
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.02em;
	margin: 0;
	color: ${({ theme }) => theme.colors.text};
`;

const SectionHeader = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing.sm};
	width: 100%;
`;

const SectionActions = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing.sm};
`;

const TableScroll = styled.div`
	width: 100%;
	overflow-x: auto;
	border-radius: ${({ theme }) => theme.radii.md};
`;

const MutedText = styled.p`
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	line-height: 1.5;
	color: ${({ theme }) => theme.colors.muted};
`;

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
	background: transparent;
	border: none;
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
`;

const StatLabel = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
`;

const StatValue = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.H3};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.03em;
	color: ${({ theme }) => theme.colors.text};
	font-variant-numeric: tabular-nums;
`;

export {
	FullWidth,
	Nav,
	NavBrand,
	NavTitle,
	Logotype,
	Main,
	Heading,
	Content,
	Article,
	Credits,
	StyledTable,
	FooterWrapper,
	FooterContent,
	FooterAside,
	MintLayout,
	Panel,
	StatusBox,
	ResponseBlock,
	FullScreenMain,
	FullScreenStack,
	PageIntro,
	ActionTableLayout,
	PageLayout,
	FormBand,
	DataBand,
	DashboardHeader,
	DashboardGrid,
	FormPanel,
	TablePanel,
	TableTitle,
	SectionHeader,
	SectionActions,
	TableScroll,
	MutedText,
	StatGrid,
	StatCard,
	StatLabel,
	StatValue,
};
