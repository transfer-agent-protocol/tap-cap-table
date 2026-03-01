import Navbar from "./Navbar";
import { FooterContent, FooterWrapper, FullWidth, Main } from "./wrappers";
interface Props {
	children: React.ReactNode;
	className?: string;
}

export default function Layout({ children }: Props) {
	return (
		<FullWidth>
			<Navbar />
			<Main>{children}</Main>
			<FooterWrapper>
				<FooterContent>
					© {new Date().getFullYear()}
				</FooterContent>
			</FooterWrapper>
		</FullWidth>
	);
}