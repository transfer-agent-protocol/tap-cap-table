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
};

export default theme;
