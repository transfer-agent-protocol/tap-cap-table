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
    }
}
