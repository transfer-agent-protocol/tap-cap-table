import styled from "styled-components";

const H1 = styled.h1`
	position: relative;
    max-width: 52rem;
    font-size: ${({ theme }) => theme.fontSizes.H1};
    line-height: ${({ theme }) => theme.lineHeights.H1};
    font-weight: 600;
	text-align: left;
    margin-bottom: 4rem;
    padding: 0;

	&::before {
		content: '#';
		position: absolute;
		font-size: inherit;
		font-weight: inherit;
		left: -1.618rem;

		/** iPhone portrait mode and equivalent devices */
		@media only screen and (max-width: 512px) {
			content: none;
		}
	}
`;

const H2 = styled.h2`
    position: relative;
    max-width: 52rem;
    font-size: ${({ theme }) => theme.fontSizes.H2};
    line-height: ${({ theme }) => theme.lineHeights.H2};
    font-weight: 600;
	text-align: left;
    margin-bottom: 3rem;
    padding: 0;

	&::before {
		content: '##';
		position: absolute;
		font-size: inherit;
		font-weight: inherit;
		left: -2.618rem;

		/** iPhone portrait mode and equivalent devices */
		@media only screen and (max-width: 512px) {
			content: none;
		}
	}
`;

const H3 = styled.h3`
	position: relative;
    max-width: 40rem;
    font-size: ${({ theme }) => theme.fontSizes.H3};
    line-height: ${({ theme }) => theme.lineHeights.H3};
    font-weight: 600;
	text-align: left;
    margin-bottom: 2rem;
    padding: 0;

	&::before {
		content: '###';
		position: absolute;
		font-size: inherit;
		font-weight: inherit;
		left: -3.618rem;
		/** iPhone portrait mode and equivalent devices */
		@media only screen and (max-width: 512px) {
			content: none;
		}
	}
`;

const P = styled.p`
    max-width: 40rem;
    font-size: ${({ theme }) => theme.fontSizes.medium};
    letter-spacing: 0.02rem;
    font-weight: 400;
    line-height: 1.618rem;
    word-wrap: break-word;
    padding: 0;
    margin: 0 0 1.58rem 0;

	/** iPhone portrait mode and equivalent devices */
	@media only screen and (max-width: 512px) {
		font-size: ${({ theme }) => theme.fontSizes.baseline};
	}
`;

export { H1, H2, H3, P };
