import type { ReactNode } from "react";
import styled from "styled-components";
import { PageHeaderBar } from "./layout";
import { H2, MutedText } from "./typography";

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
				{description ? <MutedText>{description}</MutedText> : null}
			</HeaderText>
			{actions ? <HeaderActions>{actions}</HeaderActions> : null}
		</PageHeaderBar>
	);
}
