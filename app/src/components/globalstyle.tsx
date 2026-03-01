import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
	html,
	body {
		display: flex;
		flex-flow: column nowrap;
		height: 100%;
		min-height: 100%;
		padding: 0;
		margin: 0;
		background: ${({ theme }) => theme.colors.background};
		font-weight: 400;
		font-size: 16px;
		letter-spacing: normal;
		color: ${({ theme }) => theme.colors.text};
		overflow-y: scroll;
		overflow-x: hidden;
		scroll-behavior: smooth;
	}

	a {
		color: ${({ theme }) => theme.colors.text};
		font-weight: 600;
		text-decoration: none;
		margin: 0;
		padding: 0;
		cursor: pointer;
		z-index: 2;

		&:hover, :focus, :active {
			text-decoration: none;
			outline: 0;
		}

		/** iPhone portrait mode and equivalent devices */
		@media only screen and (max-width: 512px) {
			font-size: ${({ theme }) => theme.fontSizes.baseline};
		}
	}

	button:focus {
		outline: 0;
	}

	* {
		box-sizing: border-box;
	}

	::selection {
		background: ${({ theme }) => theme.colors.main};
		color: ${({ theme }) => theme.colors.background};
	}
`;

export default GlobalStyle;
