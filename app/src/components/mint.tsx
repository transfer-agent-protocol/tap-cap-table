import styled from "styled-components";

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

export { MintLayout, Panel, StatusBox, ResponseBlock };
