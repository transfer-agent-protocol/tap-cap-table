import "styled-components";

declare module "styled-components" {
	export interface DefaultTheme {
		colors: {
			background: string;
			surface: string;
			elevated: string;
			border: string;
			borderStrong: string;
			text: string;
			textMuted: string;
			textSubtle: string;
			accent: string;
			accentMuted: string;
			onAccent: string;
			success: string;
			successBg: string;
			error: string;
			errorBg: string;
			pending: string;
			pendingBg: string;
			overlay: string;
			inverse: string;
		};
		fonts: {
			sans: string;
			mono: string;
		};
		fontSizes: {
			H1: string;
			H2: string;
			H3: string;
			large: string;
			medium: string;
			baseline: string;
			small: string;
			xs: string;
		};
		lineHeights: {
			H1: string;
			H2: string;
			H3: string;
			P: string;
		};
		fontWeights: {
			normal: number;
			medium: number;
			semibold: number;
			bold: number;
		};
		spacing: {
			0: string;
			xs: string;
			sm: string;
			md: string;
			lg: string;
			xl: string;
			"2xl": string;
			"3xl": string;
			"4xl": string;
		};
		breakpoints: {
			phone: string;
			tablet: string;
			tabletLandscape: string;
			desktop: string;
		};
		radii: {
			none: string;
		};
		shadows: {
			overlay: string;
			focus: string;
		};
		transitions: {
			default: string;
			slow: string;
		};
		maxWidths: {
			text: string;
			form: string;
			content: string;
		};
		zIndices: {
			base: number;
			dropdown: number;
			sticky: number;
			modal: number;
			toast: number;
		};
		layout: {
			navWidth: string;
			topBar: string;
		};
	}
}
