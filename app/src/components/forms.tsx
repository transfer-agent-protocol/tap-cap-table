import styled, { css } from "styled-components";

/**
 * Forms — one input set. Labels uppercase micro-type, inputs mono
 * (users type numbers, names, addresses into a ledger), hairline borders.
 */

const Form = styled.form`
	position: relative;
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
	width: 100%;
	max-width: ${({ theme }) => theme.maxWidths.form};
	gap: ${({ theme }) => theme.spacing.lg};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		max-width: 100%;
	}
`;

/** Group of related fields (Proximity: related things sit together). */
const Fieldset = styled.fieldset`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	margin: 0;
	padding: 0;
	border: none;
	min-width: 0;
`;

/** One label + input + validation unit. */
const Field = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
	min-width: 0;
`;

/** Fields side by side; stacks on phones. */
const FieldRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	align-items: flex-end;

	& > * {
		flex: 1 1 0;
		min-width: 0;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		flex-flow: column nowrap;
		gap: ${({ theme }) => theme.spacing.sm};
		align-items: stretch;
	}
`;

const FieldLabel = styled.label`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.textSubtle};
`;

const inputBase = css`
	width: 100%;
	height: 2.5rem;
	padding: 0 ${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-family: ${({ theme }) => theme.fonts.mono};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
	color: ${({ theme }) => theme.colors.text};
	transition: border-color ${({ theme }) => theme.transitions.default};

	&::placeholder {
		color: ${({ theme }) => theme.colors.textSubtle};
	}

	&:hover:not(:disabled) {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.accent};
	}

	&:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
`;

const TextInput = styled.input`
	${inputBase}
`;

const Select = styled.select`
	${inputBase}
	cursor: pointer;

	option {
		background: ${({ theme }) => theme.colors.background};
		color: ${({ theme }) => theme.colors.text};
	}
`;

const TextArea = styled.textarea`
	${inputBase}
	height: auto;
	min-height: 8rem;
	padding: ${({ theme }) => theme.spacing.md};
	resize: vertical;
`;

/** Inline error under a field. */
const ValidationMessage = styled.span`
	display: block;
	color: ${({ theme }) => theme.colors.error};
	font-size: ${({ theme }) => theme.fontSizes.small};
`;

export { Form, Fieldset, Field, FieldRow, FieldLabel, TextInput, Select, TextArea, ValidationMessage };
