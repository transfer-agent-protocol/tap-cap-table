import styled from "styled-components";

const FormWrapper = styled.form`
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: left;
    justify-content: flex-start;
    align-self: flex-start;
    width: 95%;
	height: 100%;
	min-height: 100vh;
    margin: 0 auto;

	label {
		font-size: 1.25rem;
		font-weight: 600;
		color: ${({ theme }) => theme.colors.text};
		margin: 1rem 0 1rem 0;
	}

	p {
		color: ${({ theme }) => theme.colors.text};
		font-size: 0.9rem;
		margin: 0.1rem 0 0 0;
	}
`;

const FormInput = styled.input`
    width: 30rem;
    height: 3rem;
    padding: 0 1.25rem;
    background: ${({ theme }) => theme.colors.input};
    border: none;
    border-radius: 4px;
    box-sizing: border-box;
    outline: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
	font-family: "IBM Plex Mono", sans-serif;
    margin-bottom: 0.5rem;

    &:focus {
        outline: 1px solid ${({ theme }) => theme.colors.accent};
    }

    &:hover {
        outline: 1px solid ${({ theme }) => theme.colors.accent};
		box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.accent};
    }

    @media only screen and (max-width: 768px) {
        position: relative;
        width: 100%;
        height: 3rem;
        margin-right: 0;
        margin-bottom: 0.5rem;
    }
`;

const FormTextArea = styled.textarea`
    width: 30rem;
    height: 10rem;
    padding: 1.25rem;
    background: ${({ theme }) => theme.colors.input};
    border: none;
    border-radius: 4px;
    box-sizing: border-box;
    outline: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
	font-family: "IBM Plex Mono", sans-serif;
    margin-bottom: 0.5rem;
    resize: vertical;

    &:focus {
        outline: 1px solid ${({ theme }) => theme.colors.accent};
    }

    &:hover {
        outline: 1px solid ${({ theme }) => theme.colors.accent};
    }

    @media only screen and (max-width: 768px) {
        position: relative;
        width: 100%;
        height: 10rem;
        margin-right: 0;
        margin-bottom: 0.5rem;
    }
`;

const FormValidation = styled.span`
    display: relative;
    position: absolute;
    bottom: -1.5rem;
    right: -2.5rem;
    color: ${({ theme }) => theme.colors.text};
`;

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

export { FormWrapper, FormInput, FormTextArea, FormValidation, FieldGroup, FieldRow, FieldLabel, SectionLabel, Input, Divider };
