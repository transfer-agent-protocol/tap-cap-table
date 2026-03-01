import styled from "styled-components";

const FullWidth = styled.div`
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
	align-items: center;
	width: 100%;
`;

const Nav = styled.nav`
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
	align-items: center;
	width: 100%;
	max-width: 100%;
	padding: 1rem 0;
`;

const Main = styled.main`
    display: flex;
    flex-flow: column nowrap;
	align-items: flex-start;
	justify-content: flex-start;
	width: 100%;
	max-width: 768px;
	padding: 0 0 0 3rem;

    /** Generic tablet and equivalent devices */
    @media only screen and (max-width: 768px) {
    }
    /** iPhone portrait mode and equivalent devices */
    @media only screen and (max-width: 512px) {
		width: 80%;
		padding: 0 0 0 0.618rem;
    }

    mark {
        color: ${({ theme }) => theme.colors.background};
        background-color: ${({ theme }) => theme.colors.main};;
		font-weight: 500;
    }
`;

const Heading = styled.div`
    display: flex;
    flex-flow: column nowrap;
	align-items: flex-start;
	justify-content: flex-start;
	margin: 8rem 0 2rem 0;
  

    /** iPhone portrait mode and equivalent devices */
    @media only screen and (max-width: 768px) {
        margin: 4rem 0;
    }

    /** iPhone portrait mode and equivalent devices */
    @media only screen and (max-width: 512px) {
        margin: 2rem 0;
    }

	a {
		font-size: ${({ theme }) => theme.fontSizes.medium};
        padding: 0 1rem 0 0;
        /** iPhone portrait mode and equivalent devices */
		@media only screen and (max-width: 512px) {
			font-size: ${({ theme }) => theme.fontSizes.medium};
			padding: 0 0.3rem 0 0;
		}
    }

	a:hover {
		color: ${({ theme }) => theme.colors.background};
		background: ${({ theme }) => theme.colors.main};
	}
`;

const Content = styled.div`
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
	justify-content: flex-start;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: ${({ theme }) => theme.fontSizes.baseline};
  table-layout: fixed; /* Helps to apply word wrapping */

  th, td {
    text-align: left;
    padding: 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.main};
    word-break: break-word; /* Ensures text wraps inside the cell */
  }

  th {
    background-color: ${({ theme }) => theme.colors.main};
    color: ${({ theme }) => theme.colors.background};
  }

  td a {
    color: ${({ theme }) => theme.colors.main};
    text-decoration: none;
    display: inline-block; /* Can help with better handling of wrapping for links */
    max-width: 100%; /* Prevents the link from overflowing its container */
  }

  td a:hover {
    color: ${({ theme }) => theme.colors.background};
    background: ${({ theme }) => theme.colors.main};
  }

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSizes.small};
    th, td {
      padding: 0.3rem; /* Smaller padding for smaller screens */
    }
  }
`;



const FooterWrapper = styled.footer`
    display: flex;
    flex-flow: column nowrap;
    flex-shrink: 0;
   	align-items: flex-start;
    align-self: center;
    justify-content: flex-start;
    margin: 4rem auto;
`;

const FooterContent = styled.div`
    display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: flex-start;
	width: 100%;
	margin: 0 auto;
`;

export { FullWidth, Nav, Main, Heading, Content, StyledTable, FooterWrapper, FooterContent };
