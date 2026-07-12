import styled from "styled-components";

/**
 * Layout — page scaffolding on a strict grid.
 * Compose pages from these; no ad-hoc margins in views.
 */

/** Full-width workspace page container. */
const Page = styled.main`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xl};
	width: 100%;
	min-height: calc(100vh - ${({ theme }) => theme.layout.topBar} - 4rem);
	padding: ${({ theme }) => theme.spacing.xl};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: ${({ theme }) => theme.spacing.lg};
		gap: ${({ theme }) => theme.spacing.lg};
	}
`;

/** Centered reading column for marketing / text-first pages. */
const ContentColumn = styled.main`
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
	width: 100%;
	max-width: ${({ theme }) => theme.maxWidths.content};
	padding: ${({ theme }) => theme.spacing["3xl"]} ${({ theme }) => theme.spacing.xl};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
	}
`;

/** Vertical flow with grid-step gaps. */
const Stack = styled.div<{ $gap?: "sm" | "md" | "lg" | "xl" | "2xl" }>`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme, $gap = "lg" }) => theme.spacing[$gap]};
	width: 100%;
	min-width: 0;
`;

/** Discrete page region separated by whitespace. */
const Section = styled.section`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	min-width: 0;
`;

/** Section title row: heading left, actions right. */
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

/**
 * Strict column grid. Columns collapse to a single column below the
 * tablet-landscape breakpoint (iPad portrait and phones stack).
 */
const Grid = styled.div<{ $columns?: string }>`
	display: grid;
	grid-template-columns: ${({ $columns = "1fr 1fr" }) => $columns};
	gap: ${({ theme }) => theme.spacing.xl};
	align-items: start;
	width: 100%;

	@media (max-width: ${({ theme }) => theme.breakpoints.tabletLandscape}) {
		grid-template-columns: 1fr;
		gap: ${({ theme }) => theme.spacing.lg};
	}
`;

/** Header band under the top bar — answers "where am I". */
const PageHeaderBar = styled.header`
	display: flex;
	flex-flow: row wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	padding-bottom: ${({ theme }) => theme.spacing.lg};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export { Page, ContentColumn, Stack, Section, SectionHeader, SectionActions, Grid, PageHeaderBar };
