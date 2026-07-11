import "styled-components";

declare module "styled-components" {
	export interface DefaultTheme {
		colors: {
			background: string;
			surface: string;
			elevated: string;
			main: string;
			input: string;
			accent: string;
			accentMuted: string;
			text: string;
			muted: string;
			subtle: string;
			outline: string;
			borderStrong: string;
			success: string;
			successBg: string;
			error: string;
			errorBg: string;
			pending: string;
			pendingBg: string;
			overlay: string;
			inverse: string;
			white: string;
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
		borderRadius: {
			none: string;
			main: string;
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
		};
		fontWeights: {
			normal: number;
			medium: number;
			semibold: number;
			bold: number;
		};
		breakpoints: {
			sm: string;
			mobile: string;
			tablet: string;
			mintCollapse: string;
			desktop: string;
		};
		radii: {
			none: string;
			main: string;
			sm: string;
			md: string;
			lg: string;
			pill: string;
		};
		shadows: {
			sm: string;
			md: string;
			lg: string;
			focus: string;
			glow: string;
		};
		transitions: {
			default: string;
			spring: string;
			slow: string;
		};
		maxWidths: {
			main: string;
			article: string;
			h1: string;
			content: string;
			wide: string;
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
			navCollapsed: string;
			topBar: string;
		};
	}
}
