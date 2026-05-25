import { useRouter } from "next/router";
import Navbar from "./Navbar";
import { FooterContent, FooterWrapper, FullWidth, Main, FullScreenMain } from "./wrappers";
interface Props {
	children: React.ReactNode;
	className?: string;
}

export default function Layout({ children }: Props) {
	const { pathname } = useRouter();
	const isMintPage = pathname === "/mint";
	const isManagePage = pathname === "/manage" || pathname.startsWith("/manage/");

	return (
		<FullWidth>
			<Navbar />
			{isMintPage || isManagePage ? (
				<FullScreenMain>{children}</FullScreenMain>
			) : (
				<Main>{children}</Main>
			)}
			<FooterWrapper>
				<FooterContent>
					© {new Date().getFullYear()}
				</FooterContent>
			</FooterWrapper>
		</FullWidth>
	);
}