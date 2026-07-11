import styled from "styled-components";

const FormWrapper = styled.form`
	position: relative;
	display: flex;
	flex-flow: column nowrap;
	align-items: stretch;
	justify-content: flex-start;
	width: 100%;
	gap: ${({ theme }) => theme.spacing.md};

	label {
		font-size: ${({ theme }) => theme.fontSizes.xs};
		font-weight: ${({ theme }) => theme.fontWeights.semibold};
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: ${({ theme }) => theme.colors.subtle};
	}

	p {
		color: ${({ theme }) => theme.colors.muted};
		font-size: ${({ theme }) => theme.fontSizes.small};
		margin: 0;
	}
`;

const FormInput = styled.input`
	width: 100%;
	max-width: 30rem;
	height: 2.75rem;
	padding: 0 ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: 0;
	color: ${({ theme }) => theme.colors.text};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-family: inherit;
	transition: border-color ${({ theme }) => theme.transitions.default};

	&::placeholder {
		color: ${({ theme }) => theme.colors.subtle};
	}

	&:hover:not(:disabled) {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.main};
	}

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		max-width: 100%;
	}
`;

const FormTextArea = styled.textarea`
	width: 100%;
	max-width: 30rem;
	min-height: 8rem;
	padding: ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: 0;
	color: ${({ theme }) => theme.colors.text};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-family: inherit;
	resize: vertical;
	transition: border-color ${({ theme }) => theme.transitions.default},
		box-shadow ${({ theme }) => theme.transitions.default};

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.main};
		box-shadow: ${({ theme }) => theme.shadows.focus};
	}

	@media only screen and (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		max-width: 100%;
	}
`;

const FormValidation = styled.span`
	display: block;
	color: ${({ theme }) => theme.colors.error};
	font-size: ${({ theme }) => theme.fontSizes.small};
`;

const FieldGroup = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
	min-width: 0;
`;

const FieldRow = styled.div`
	display: flex;
	flex-flow: row nowrap;
	gap: ${({ theme }) => theme.spacing.md};
	align-items: flex-end;

	& > * {
		flex: 1 1 0;
		min-width: 0;
	}

	@media only screen and (max-width: 600px) {
		flex-flow: column nowrap;
		gap: ${({ theme }) => theme.spacing.sm};
	}
`;

const FieldLabel = styled.label`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
`;

const SectionLabel = styled.h3`
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	margin: ${({ theme }) => theme.spacing.sm} 0 0;
	color: ${({ theme }) => theme.colors.text};
	letter-spacing: -0.02em;
`;

const Input = styled.input`
	width: 100%;
	height: 2.625rem;
	padding: 0 ${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-family: inherit;
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: 0;
	color: ${({ theme }) => theme.colors.text};
	box-sizing: border-box;
	transition: border-color ${({ theme }) => theme.transitions.default};

	&::placeholder {
		color: ${({ theme }) => theme.colors.subtle};
	}

	&:hover:not(:disabled) {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.main};
		background: ${({ theme }) => theme.colors.elevated};
	}

	&:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
`;

const Select = styled.select`
	width: 100%;
	height: 2.625rem;
	padding: 0 ${({ theme }) => theme.spacing.md};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-family: inherit;
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: 0;
	color: ${({ theme }) => theme.colors.text};
	box-sizing: border-box;
	cursor: pointer;
	transition: border-color ${({ theme }) => theme.transitions.default};

	&:hover:not(:disabled) {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.main};
	}

	&:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	option {
		background: ${({ theme }) => theme.colors.elevated};
		color: ${({ theme }) => theme.colors.text};
	}
`;

const Divider = styled.hr`
	width: 100%;
	border: none;
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	margin: ${({ theme }) => theme.spacing.sm} 0;
`;

export {
	FormWrapper,
	FormInput,
	FormTextArea,
	FormValidation,
	FieldGroup,
	FieldRow,
	FieldLabel,
	SectionLabel,
	Input,
	Select,
	Divider,
};
