import { DefaultTheme } from "styled-components";

const theme: DefaultTheme = {
	colors: {
		background: "#FAFAFC",
		main: "#0C0B0C",
		input: "#D2C8BB",
		accent: "#FFD700",
		text: "#0C0B0C",
		outline: "#11202D",
		success: "#16a34a",
		successBg: "rgba(22, 163, 74, 0.08)",
		error: "#dc2626",
		errorBg: "rgba(220, 38, 38, 0.08)",
		pending: "#d97706",
		pendingBg: "rgba(217, 119, 6, 0.08)",
	},
	fontSizes: {
		H1: "2rem",
		H2: "1.75rem",
		H3: "1.5rem",
		large: "1.4rem",
		medium: "1.2rem",
		baseline: "1rem",
		small: "0.8rem",
	},
	lineHeights: {
		H1: "2rem",
		H2: "2rem",
		H3: "2rem",
		P: "1rem",
	},
	borderRadius: {
		none: "0",
		main: "0.131rem",
	},
	spacing: {
		0: "0",
		xs: "0.25rem",
		sm: "0.5rem",
		md: "1rem",
		lg: "1.5rem",
		xl: "2rem",
		"2xl": "3rem",
		"3xl": "4rem",
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
		mintCollapse: "900px",
	},
	radii: {
		none: "0",
		main: "0.131rem",
		sm: "4px",
		md: "0.5rem",
	},
	shadows: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		focus: "0 0 0 2px #0C0B0C",
	},
	transitions: {
		default: "all 0.168s cubic-bezier(0.211, 0.69, 0.313, 1)",
		spring: "0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
	},
	maxWidths: {
		main: "768px",
		article: "46rem",
		h1: "52rem",
	},
	zIndices: {
		base: 1,
		dropdown: 10,
		modal: 100,
	},
};

export default theme;
