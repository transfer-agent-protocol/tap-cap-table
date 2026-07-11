import { DefaultTheme } from "styled-components";

/**
 * TAP Design System — "Ledger Signal"
 *
 * Dark, monospaced, onchain-native. Anti-spreadsheet / anti-Carta.
 * Primary actions use acid signal green; surfaces are layered zinc.
 * Existing token names (main, background, input…) keep working for
 * legacy styled components while new surface/muted/border tokens
 * unlock the full system.
 */
const theme: DefaultTheme = {
	colors: {
		// Canvas & layers
		background: "#09090b",
		surface: "#111113",
		elevated: "#18181b",
		// Primary "signal" (also maps to legacy `main` for buttons/headers)
		main: "#c8f542",
		// Field / hover fills (legacy `input`)
		input: "#1c1c21",
		// Accent alias (kept for forms that target accent)
		accent: "#c8f542",
		accentMuted: "rgba(200, 245, 66, 0.12)",
		// Text
		text: "#f4f4f5",
		muted: "#a1a1aa",
		subtle: "#71717a",
		// Lines
		outline: "rgba(255, 255, 255, 0.08)",
		borderStrong: "rgba(255, 255, 255, 0.14)",
		// Semantic
		success: "#34d399",
		successBg: "rgba(52, 211, 153, 0.12)",
		error: "#fb7185",
		errorBg: "rgba(251, 113, 133, 0.12)",
		pending: "#fbbf24",
		pendingBg: "rgba(251, 191, 36, 0.12)",
		// Special
		overlay: "rgba(0, 0, 0, 0.72)",
		inverse: "#09090b",
		white: "#ffffff",
	},
	fontSizes: {
		H1: "clamp(2.25rem, 4vw, 3.25rem)",
		H2: "clamp(1.5rem, 2.5vw, 1.875rem)",
		H3: "1.25rem",
		large: "1.125rem",
		medium: "1rem",
		baseline: "0.9375rem",
		small: "0.75rem",
		xs: "0.6875rem",
	},
	lineHeights: {
		H1: "1.1",
		H2: "1.2",
		H3: "1.3",
		P: "1.6",
	},
	borderRadius: {
		none: "0",
		main: "0.5rem",
	},
	spacing: {
		0: "0",
		xs: "0.25rem",
		sm: "0.5rem",
		md: "1rem",
		lg: "1.5rem",
		xl: "2rem",
		"2xl": "3rem",
		"3xl": "4.5rem",
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
		main: "0.5rem",
		sm: "0.375rem",
		md: "0.75rem",
		lg: "1rem",
		pill: "999px",
	},
	shadows: {
		sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
		md: "0 8px 24px rgba(0, 0, 0, 0.45)",
		lg: "0 24px 48px rgba(0, 0, 0, 0.55)",
		focus: "0 0 0 2px #09090b, 0 0 0 4px #c8f542",
		glow: "0 0 24px rgba(200, 245, 66, 0.18)",
	},
	transitions: {
		default: "160ms cubic-bezier(0.22, 1, 0.36, 1)",
		spring: "280ms cubic-bezier(0.34, 1.4, 0.64, 1)",
		slow: "320ms cubic-bezier(0.22, 1, 0.36, 1)",
	},
	maxWidths: {
		main: "42rem",
		article: "46rem",
		h1: "52rem",
		content: "72rem",
		wide: "90rem",
	},
	zIndices: {
		base: 1,
		dropdown: 20,
		sticky: 30,
		modal: 100,
		toast: 110,
	},
	layout: {
		navWidth: "15.5rem",
		navCollapsed: "4.25rem",
		topBar: "3.75rem",
	},
};

export default theme;
