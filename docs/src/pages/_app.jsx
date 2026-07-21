import "../styles/globals.css";
import { TableEnhancer } from "../components/ResponsiveTable";

export default function App({ Component, pageProps }) {
	return (
		<>
			<TableEnhancer />
			<Component {...pageProps} />
		</>
	);
}
