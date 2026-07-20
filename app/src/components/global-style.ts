import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	:root {
		color-scheme: dark;
	}

	html {
		height: 100%;
		font-family: ${({ theme }) => theme.fonts.sans};
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
		font-family: ${({ theme }) => theme.fonts.sans};
		font-weight: ${({ theme }) => theme.fontWeights.normal};
		font-size: 15px;
		line-height: ${({ theme }) => theme.lineHeights.P};
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

	::selection {
		background: ${({ theme }) => theme.colors.accent};
		color: ${({ theme }) => theme.colors.onAccent};
	}

	a {
		color: ${({ theme }) => theme.colors.accent};
		font-weight: ${({ theme }) => theme.fontWeights.medium};
		text-decoration: none;
		transition: color ${({ theme }) => theme.transitions.default},
			text-decoration-color ${({ theme }) => theme.transitions.default};

		&:hover {
			text-decoration: underline;
			text-decoration-thickness: 1px;
			text-underline-offset: 0.2em;
		}
	}

	button,
	input,
	select,
	textarea {
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

	/* Data is mono — numbers, addresses, hashes, code */
	code {
		font-family: ${({ theme }) => theme.fonts.mono};
		font-size: 0.9em;
		padding: 0.1em 0.35em;
		background: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.text};
	}

	/* Minimal monochrome scrollbars */
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
		border: 2px solid transparent;
		background-clip: padding-box;
	}

	input, select, textarea {
		color-scheme: dark;
	}

	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.001ms !important;
			transition-duration: 0.001ms !important;
		}
	}
`;

export default GlobalStyle;
