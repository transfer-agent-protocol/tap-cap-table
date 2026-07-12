import type { ReactNode } from "react";
import styled from "styled-components";
import { PageHeaderBar } from "./layout";
import { H2 } from "./typography";

const HeaderText = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
	min-width: 0;
`;

const HeaderActions = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};
`;

// Div wrapper — callers may pass <P> (a block element) as description;
// wrapping in another <p> would produce invalid HTML and a hydration error.
const DescriptionText = styled.div`
	max-width: ${({ theme }) => theme.maxWidths.text};
	font-size: ${({ theme }) => theme.fontSizes.small};
	line-height: ${({ theme }) => theme.lineHeights.P};
	color: ${({ theme }) => theme.colors.textMuted};
`;

interface PageHeaderProps {
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
}

/**
 * In-page header — answers "where am I" and "what can I do here".
 * The top bar stays system-only; every page states its own title.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<PageHeaderBar data-testid="page-header">
			<HeaderText>
				<H2 data-testid="page-title">{title}</H2>
				{description ? <DescriptionText>{description}</DescriptionText> : null}
			</HeaderText>
			{actions ? <HeaderActions>{actions}</HeaderActions> : null}
		</PageHeaderBar>
	);
}
