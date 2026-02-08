import styled from "styled-components";

const LogoRouter = styled.button`
    position: relative;
    display: inline-flex;
    flex-direction: row nowrap;
    justify-content: center;
    align-items: center;
    min-width: 48px;
    min-height: 48px;
    background-color: inherit;
    border: none;
    cursor: pointer;
    opacity: 1;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);

    &:hover {
        opacity: 0.8;
    }
`;

const StyledA = styled.button`
    position: relative;
    display: inline-flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
	width: auto;
	height: 32px;
    font-size: ${({ theme }) => theme.fontSizes.baseline};
	padding: 0 0 0 1rem;
    background-color: inherit;
    border: none;
    color: ${({ theme }) => theme.colors.text};

    &:hover {
		opacity: 0.8;
        transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }

	&:nth-last-child(1){
		padding-right: 1rem;
	}
`;

const PrimaryButton = styled.button`
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    background: ${({ theme }) => theme.colors.main};
    width: 9.875rem;
    height: 3rem;
	margin: 2rem 0 1rem 0;
    border: none;
    box-sizing: border-box;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: bold;
    font-family: "IBM Plex Mono", sans-serif;
    color: #FFFFFF;
    cursor: pointer;
    transition: all 0.168s cubic-bezier(0.211, 0.69, 0.313, 1);

    &:hover {
        opacity: 0.9;
    }
`;

const WalletButtonStyled = styled.button`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	background: ${({ theme }) => theme.colors.main};
	height: 2.25rem;
	padding: 0 1rem;
	margin-left: 1rem;
	border: none;
	border-radius: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: bold;
	font-family: inherit;
	color: ${({ theme }) => theme.colors.background};
	cursor: pointer;
	transition: opacity 0.168s cubic-bezier(0.211, 0.69, 0.313, 1);
	white-space: nowrap;

	&:hover {
		opacity: 0.85;
	}
`;

const MintButton = styled.button`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	background: ${({ theme }) => theme.colors.main};
	width: 100%;
	height: 3rem;
	margin-top: 1rem;
	border: none;
	border-radius: 4px;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: bold;
	font-family: inherit;
	color: ${({ theme }) => theme.colors.background};
	cursor: pointer;
	transition: all 0.168s cubic-bezier(0.211, 0.69, 0.313, 1);

	&:hover:not(:disabled) {
		opacity: 0.9;
	}

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

export { LogoRouter, StyledA, PrimaryButton, WalletButtonStyled, MintButton }
