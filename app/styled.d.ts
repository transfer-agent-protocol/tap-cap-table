import "styled-components";

declare module "styled-components" {
    export interface DefaultTheme {
        colors: {
            background: string;
            main: string;
            input: string;
            text: string;
            accent: string;
            outline: string;
            success: string;
            successBg: string;
            error: string;
            errorBg: string;
            pending: string;
            pendingBg: string;
        };
        fontSizes: {
            H1: string;
            H2: string;
            H3: string;
            large: string;
            medium: string;
            baseline: string;
            small: string;
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
        };
        radii: {
            none: string;
            main: string;
            sm: string;
            md: string;
        };
        shadows: {
            sm: string;
            focus: string;
        };
        transitions: {
            default: string;
            spring: string;
        };
        maxWidths: {
            main: string;
            article: string;
            h1: string;
        };
        zIndices: {
            base: number;
            dropdown: number;
            modal: number;
        };
    }
}
