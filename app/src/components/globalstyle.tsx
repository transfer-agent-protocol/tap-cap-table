import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
	html {
		height: 100%;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-rendering: optimizeLegibility;
	}

	body {
		display: flex;
		flex-flow: column nowrap;
		min-height: 100%;
		margin: 0;
		padding: 0;
		font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-weight: ${({ theme }) => theme.fontWeights.normal};
		font-size: 15px;
		line-height: ${({ theme }) => theme.lineHeights.P};
		letter-spacing: -0.01em;
		color: ${({ theme }) => theme.colors.text};
		background: ${({ theme }) => theme.colors.background};
		overflow-y: scroll;
		overflow-x: hidden;
		scroll-behavior: smooth;
	}

	#__next {
		flex: 1;
		width: 100%;
		min-height: 100%;
		display: flex;
	}

	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	::selection {
		background: ${({ theme }) => theme.colors.main};
		color: ${({ theme }) => theme.colors.inverse};
	}

	a {
		color: ${({ theme }) => theme.colors.main};
		font-weight: ${({ theme }) => theme.fontWeights.medium};
		text-decoration: none;
		transition: color ${({ theme }) => theme.transitions.default},
			opacity ${({ theme }) => theme.transitions.default},
			text-decoration-color ${({ theme }) => theme.transitions.default};

		/* Never flip body links to white — keeps contrast on dark surfaces */
		&:hover {
			color: ${({ theme }) => theme.colors.main};
			text-decoration: underline;
			text-decoration-thickness: 1px;
			text-underline-offset: 0.2em;
			opacity: 0.92;
		}
	}

	button {
		font-family: inherit;
	}

	button:focus-visible,
	a:focus-visible,
	input:focus-visible,
	select:focus-visible,
	textarea:focus-visible {
		outline: none;
		box-shadow: ${({ theme }) => theme.shadows.focus};
	}

	/* Subtle custom scrollbars */
	* {
		scrollbar-width: thin;
		scrollbar-color: ${({ theme }) => theme.colors.borderStrong} transparent;
	}

	::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.colors.borderStrong};
		border-radius: ${({ theme }) => theme.radii.pill};
		border: 2px solid transparent;
		background-clip: padding-box;
	}

	code {
		font-family: inherit;
		font-size: 0.9em;
		padding: 0.1em 0.35em;
		border-radius: ${({ theme }) => theme.radii.sm};
		background: ${({ theme }) => theme.colors.input};
		color: ${({ theme }) => theme.colors.main};
	}

	input, select, textarea {
		color-scheme: dark;
	}
`;

export default GlobalStyle;
