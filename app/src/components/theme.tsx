import { DefaultTheme } from "styled-components";

/**
 * TAP Design System — sharp ledger
 * Flat dark surfaces, 0 radius, 1px hairlines. No pill chrome.
 */
const theme: DefaultTheme = {
	colors: {
		background: "#09090b",
		surface: "#0e0e10",
		elevated: "#141416",
		main: "#c8f542",
		input: "#1a1a1d",
		accent: "#c8f542",
		accentMuted: "rgba(200, 245, 66, 0.1)",
		text: "#f4f4f5",
		muted: "#a1a1aa",
		subtle: "#71717a",
		outline: "rgba(255, 255, 255, 0.1)",
		borderStrong: "rgba(255, 255, 255, 0.16)",
		success: "#34d399",
		successBg: "rgba(52, 211, 153, 0.1)",
		error: "#fb7185",
		errorBg: "rgba(251, 113, 133, 0.1)",
		pending: "#fbbf24",
		pendingBg: "rgba(251, 191, 36, 0.1)",
		overlay: "rgba(0, 0, 0, 0.75)",
		inverse: "#09090b",
		white: "#ffffff",
	},
	fontSizes: {
		H1: "clamp(1.75rem, 3.5vw, 2.5rem)",
		H2: "clamp(1.25rem, 2vw, 1.5rem)",
		H3: "1.125rem",
		large: "1.0625rem",
		medium: "1rem",
		baseline: "0.9375rem",
		small: "0.8125rem",
		xs: "0.6875rem",
	},
	lineHeights: {
		H1: "1.15",
		H2: "1.25",
		H3: "1.3",
		P: "1.55",
	},
	borderRadius: {
		none: "0",
		main: "0",
	},
	spacing: {
		0: "0",
		xs: "0.25rem",
		sm: "0.5rem",
		md: "0.875rem",
		lg: "1.25rem",
		xl: "1.75rem",
		"2xl": "2.5rem",
		"3xl": "3.5rem",
	},
	fontWeights: {
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	},
	breakpoints: {
		sm: "475px",
		mobile: "512px",
		tablet: "768px",
		mintCollapse: "960px",
		desktop: "1200px",
	},
	radii: {
		none: "0",
		main: "0",
		sm: "0",
		md: "0",
		lg: "0",
		pill: "0",
	},
	shadows: {
		sm: "none",
		md: "none",
		lg: "0 16px 40px rgba(0, 0, 0, 0.45)",
		focus: "0 0 0 1px #c8f542",
		glow: "none",
	},
	transitions: {
		default: "120ms ease",
		spring: "160ms ease",
		slow: "200ms ease",
	},
	maxWidths: {
		main: "42rem",
		article: "46rem",
		h1: "40rem",
		content: "56rem",
		wide: "72rem",
	},
	zIndices: {
		base: 1,
		dropdown: 20,
		sticky: 30,
		modal: 100,
		toast: 110,
	},
	layout: {
		navWidth: "13.5rem",
		navCollapsed: "0",
		topBar: "3.25rem",
	},
};

export default theme;
