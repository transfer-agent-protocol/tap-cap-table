import styled from "styled-components";

const FieldGroup = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.25rem;
	min-width: 0; /* Allow flex children to shrink below content size */
`;

const FieldRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	gap: 1rem;
	align-items: flex-end; /* Align inputs at bottom when labels wrap */

	& > * {
		flex: 1 1 0; /* Equal basis so columns are same width */
		min-width: 0;
	}

	@media only screen and (max-width: 600px) {
		flex-flow: column nowrap;
		gap: 0.75rem;
	}
`;

const FieldLabel = styled.label`
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: bold;
	text-transform: uppercase;
	letter-spacing: 0.05rem;
`;

const SectionLabel = styled.h3`
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: bold;
	margin: 0.5rem 0 0;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.75rem;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-family: inherit;
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.borderRadius.main};
	color: ${({ theme }) => theme.colors.text};
	box-sizing: border-box;

	&:focus {
		outline: 2px solid ${({ theme }) => theme.colors.main};
		outline-offset: 1px;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const Divider = styled.hr`
	width: 100%;
	border: none;
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	margin: 0.5rem 0;
`;

export { FieldGroup, FieldRow, FieldLabel, SectionLabel, Input, Divider };
