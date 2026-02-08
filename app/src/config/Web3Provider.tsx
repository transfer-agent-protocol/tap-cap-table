import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiAdapter } from "./wagmi";

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={wagmiAdapter.wagmiConfig}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
}
