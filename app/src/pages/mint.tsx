import { H2, P } from "../components/typography";
import { MintLayout, Panel } from "../components/wrappers";
import { IssuerForm } from "../components/IssuerForm";
import { MintActions } from "../components/MintActions";
import { useMintIssuer } from "../hooks/useMintIssuer";

export default function MintPage() {
	const mint = useMintIssuer();

	return (
		<>
			<H2>Mint Cap Table</H2>
			<P>
				Deploy a new onchain cap table with your wallet. This feature is in dev preview — the
				server isn't deployed yet, so minting will fail. Thanks for following our development.
			</P>

			<MintLayout>
				<Panel>
					<IssuerForm fields={mint.fields} setField={mint.setField} disabled={mint.isBusy} />
				</Panel>

				<Panel>
					<MintActions
						isConnected={mint.isConnected}
						canMint={mint.canMint}
						isWritePending={mint.isWritePending}
						isConfirming={mint.isConfirming}
						isRegistering={mint.isRegistering}
						isConfirmed={mint.isConfirmed}
						txHash={mint.txHash}
						deployedAddress={mint.deployedAddress}
						writeError={mint.writeError}
						serverError={mint.serverError}
						result={mint.result}
						onMint={mint.handleMint}
					/>
				</Panel>
			</MintLayout>
		</>
	);
}
