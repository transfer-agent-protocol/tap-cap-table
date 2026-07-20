import { DefaultTheme } from "styled-components";

/**
 * TAP Design System — strict ledger.
 *
 * Monochrome base: near-black background with a white-opacity gray ramp for
 * surfaces, hairlines, and secondary text. One rust accent for interactive
 * emphasis (AA on dark). 0 radius, 1px hairlines, 4px spacing grid.
 *
 * Fonts come from next/font CSS variables set in _app.tsx:
 * sans (Inter) for UI copy, mono (IBM Plex Mono) for data — numbers,
 * addresses, tables, tx hashes.
 */
const theme: DefaultTheme = {
	colors: {
		// Base
		background: "#0a0a0a",
		surface: "rgba(255, 255, 255, 0.04)",
		elevated: "rgba(255, 255, 255, 0.08)",
		// Hairlines
		border: "rgba(255, 255, 255, 0.12)",
		borderStrong: "rgba(255, 255, 255, 0.24)",
		// Text ramp
		text: "rgba(255, 255, 255, 0.92)",
		textMuted: "rgba(255, 255, 255, 0.64)",
		textSubtle: "rgba(255, 255, 255, 0.44)",
		// Accent — lime (dark text on accent surfaces)
		accent: "#c8f542",
		accentMuted: "rgba(200, 245, 66, 0.1)",
		onAccent: "#0a0a0a",
		// Status (desaturated to sit in the monochrome field)
		success: "#5cb887",
		successBg: "rgba(92, 184, 135, 0.1)",
		error: "#d96459",
		errorBg: "rgba(217, 100, 89, 0.1)",
		pending: "#cfa14e",
		pendingBg: "rgba(207, 161, 78, 0.1)",
		// Misc
		overlay: "rgba(0, 0, 0, 0.7)",
		inverse: "#0a0a0a",
	},
	// var() includes a fallback so a missing --font-* never invalidates the whole
	// stack (browser would otherwise fall through to Times / serif). Modern only.
	fonts: {
		sans: "var(--font-sans, system-ui), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
		mono: "var(--font-mono, ui-monospace), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
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
	fontWeights: {
		normal: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
	},
	// Strict 4px grid — every gap/padding/margin is a multiple of 4.
	spacing: {
		0: "0",
		xs: "0.25rem", // 4px
		sm: "0.5rem", // 8px
		md: "0.75rem", // 12px
		lg: "1rem", // 16px
		xl: "1.5rem", // 24px
		"2xl": "2rem", // 32px
		"3xl": "3rem", // 48px
		"4xl": "4rem", // 64px
	},
	// Device-anchored: phone ≤430 (iPhone), tablet 768 (iPad portrait),
	// tabletLandscape 1024 (iPad landscape), desktop beyond.
	breakpoints: {
		phone: "430px",
		tablet: "768px",
		tabletLandscape: "1024px",
		desktop: "1200px",
	},
	radii: {
		none: "0",
	},
	shadows: {
		overlay: "0 16px 40px rgba(0, 0, 0, 0.45)",
		focus: "0 0 0 1px #c8f542",
	},
	transitions: {
		default: "120ms ease",
		slow: "200ms ease",
	},
	maxWidths: {
		text: "42.5rem", // ~680px — max readable line length
		form: "30rem",
		content: "56rem",
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
		topBar: "3.25rem",
	},
};

export default theme;
