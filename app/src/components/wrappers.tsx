import styled from "styled-components";

const FullWidth = styled.div`
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
	align-items: center;
	width: 100%;
`;

const Nav = styled.nav`
	position: sticky;
	top: 0;
	z-index: ${({ theme }) => theme.zIndices.dropdown};
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	max-width: 100%;
	padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
	box-sizing: border-box;
	background: ${({ theme }) => theme.colors.background};
	border-bottom: 1px solid ${({ theme }) => theme.colors.outline};

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
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
	font-size: ${({ theme }) => theme.fontSizes.medium};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	line-height: ${({ theme }) => theme.lineHeights.H2};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
		font-size: ${({ theme }) => theme.fontSizes.baseline};
		white-space: normal;
	}
`;

const Logotype = styled.span`
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-start;
	align-items: flex-start;
	text-align: left;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: 600;
	width: 8rem;
`;

const Main = styled.main`
    display: flex;
    flex-flow: column nowrap;
	align-items: flex-start;
	justify-content: flex-start;
	width: 100%;
	max-width: 768px;
	padding: 0 0 0 3rem;

    /** Generic tablet and equivalent devices */
    @media only screen and (max-width: 768px) {
    }
    /** iPhone portrait mode and equivalent devices */
    @media only screen and (max-width: 512px) {
		width: 80%;
		padding: 0 0 0 0.618rem;
    }

    mark {
        color: ${({ theme }) => theme.colors.background};
        background-color: ${({ theme }) => theme.colors.main};;
		font-weight: 500;
    }
`;

const Heading = styled.div`
    display: flex;
    flex-flow: column nowrap;
	align-items: flex-start;
	justify-content: flex-start;
	margin: 8rem 0 2rem 0;
  

    /** iPhone portrait mode and equivalent devices */
    @media only screen and (max-width: 768px) {
        margin: 4rem 0;
    }

    /** iPhone portrait mode and equivalent devices */
    @media only screen and (max-width: 512px) {
        margin: 2rem 0;
    }

	a {
		font-size: ${({ theme }) => theme.fontSizes.medium};
        padding: 0 1rem 0 0;
        /** iPhone portrait mode and equivalent devices */
		@media only screen and (max-width: 512px) {
			font-size: ${({ theme }) => theme.fontSizes.medium};
			padding: 0 0.3rem 0 0;
		}
    }

	a:hover {
		color: ${({ theme }) => theme.colors.background};
		background: ${({ theme }) => theme.colors.main};
	}
`;

const Content = styled.div`
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
	justify-content: flex-start;
`;

const Article = styled.article`
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    align-self: flex-start;
    justify-content: flex-start;
    flex: 1;
    width: auto;
    max-width: 46rem;
    height: auto;
    margin: 0 auto;
    text-align: left;

    /** iPad Air and equivalent devices */
    @media (max-width: 820px) {
        width: 100%;
    }
    /** Generic tablet and equivalent devices */
    @media (max-width: 768px) {
        width: 98%;
        align-items: center;
    }
    /** iPhone portrait mode and equivalent devices */
    @media screen and (max-width: 512px) {
        width: 96%;
    }
`;

const Credits = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: flex-start;
	font-size: ${({ theme }) => theme.fontSizes.large};
	margin-bottom: 4rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.fontSizes.baseline};
  table-layout: fixed; /* Helps to apply word wrapping */

  th, td {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.main};
    word-break: break-word; /* Ensures text wraps inside the cell */
  }

  th {
    background-color: ${({ theme }) => theme.colors.main};
    color: ${({ theme }) => theme.colors.background};
  }

  td a {
    color: ${({ theme }) => theme.colors.main};
    text-decoration: none;
    display: inline-block; /* Can help with better handling of wrapping for links */
    max-width: 100%; /* Prevents the link from overflowing its container */
  }

  td a:hover {
    color: ${({ theme }) => theme.colors.background};
    background: ${({ theme }) => theme.colors.main};
  }

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.small};
    th, td {
      padding: 0.3rem; /* Smaller padding for smaller screens */
    }
  }
`;



const FooterWrapper = styled.footer`
    display: flex;
    flex-flow: column nowrap;
    flex-shrink: 0;
   	align-items: flext-start;
    align-self: center;
    justify-content: flex-start;
    margin: 4rem auto;
`;

const FooterContent = styled.div`
    display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: flex-start;
	width: 100%;
	margin: 0 auto;
`;

const FooterAside = styled.aside`
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    width: 100%;
    margin: 0;

    /** iPhone portrait mode and equivalent devices */
    @media only screen and (max-width: 475px) {
        font-size: ${({ theme }) => theme.fontSizes.small};
    }

    p {
        font-size: ${({ theme }) => theme.fontSizes.baseline};
        margin: 0;

        /** iPhone portrait mode and equivalent devices */
        @media only screen and (max-width: 475px) {
            font-size: ${({ theme }) => theme.fontSizes.small};
        }
    }
`;

const MintLayout = styled.div`
	display: flex;
	flex-flow: row nowrap;
	gap: 2rem;
	width: 100%;
	margin-top: 2rem;
	align-items: flex-start;

	/* Form panel (first child) gets 2x width, actions panel gets 1x */
	& > *:first-child {
		flex: 2;
	}
	& > *:last-child {
		flex: 1;
	}

	@media only screen and (max-width: 900px) {
		flex-flow: column nowrap;
		gap: 2rem;

		& > *:first-child,
		& > *:last-child {
			flex: 1;
		}
	}
`;

const Panel = styled.section`
	display: flex;
	flex-flow: column nowrap;
	gap: 1rem;
	min-width: 0;
`;

const StatusBox = styled.div<{ $variant?: "success" | "error" | "pending" }>`
	padding: 0.75rem;
	border-radius: ${({ theme }) => theme.borderRadius.main};
	font-size: ${({ theme }) => theme.fontSizes.small};
	word-break: break-all;
	border: 1px solid
		${({ theme, $variant }) =>
			$variant === "success"
				? theme.colors.success
				: $variant === "error"
					? theme.colors.error
					: theme.colors.pending};
	background: ${({ theme, $variant }) =>
		$variant === "success"
			? theme.colors.successBg
			: $variant === "error"
				? theme.colors.errorBg
				: theme.colors.pendingBg};
`;

const ResponseBlock = styled.pre`
	padding: 0.75rem;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-family: inherit;
	background: ${({ theme }) => theme.colors.input};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.borderRadius.main};
	color: ${({ theme }) => theme.colors.text};
	word-break: break-all;
	white-space: pre-wrap;
	overflow-x: auto;
	margin: 0;
`;

/* Full-screen / dashboard primitives for the updated /mint experience (additive only) */
const FullScreenMain = styled.div`
	display: flex;
	flex-flow: column nowrap;
	width: 100%;
	min-height: 70vh;
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
`;

const PageIntro = styled.section`
	display: flex;
	flex-flow: column nowrap;
	align-items: flex-start;
	gap: ${({ theme }) => theme.spacing.sm};
	max-width: ${({ theme }) => theme.maxWidths.h1};

	p {
		margin-bottom: 0;
	}
`;

const ActionTableLayout = styled.div`
	display: grid;
	grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
	gap: ${({ theme }) => theme.spacing.xl};
	align-items: flex-start;
	width: 100%;

	@media (max-width: ${({ theme }) => theme.breakpoints.mintCollapse}) {
		grid-template-columns: 1fr;
	}
`;
const DashboardHeader = styled.header`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	padding-bottom: ${({ theme }) => theme.spacing.md};
	border-bottom: 1px solid ${({ theme }) => theme.colors.outline};
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
`;

const TableTitle = styled.h3`
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
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
`;

const MutedText = styled.p`
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	line-height: 1.4;
	opacity: 0.65;
`;

export { FullWidth, Nav, NavBrand, NavTitle, Logotype, Main, Heading, Content, Article, Credits, StyledTable, FooterWrapper, FooterContent, FooterAside, MintLayout, Panel, StatusBox, ResponseBlock, FullScreenMain, FullScreenStack, PageIntro, ActionTableLayout, DashboardHeader, DashboardGrid, FormPanel, TablePanel, TableTitle, SectionHeader, SectionActions, TableScroll, MutedText };
