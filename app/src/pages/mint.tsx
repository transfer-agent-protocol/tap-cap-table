import Link from "next/link";
import { P } from "../components/typography";
import {
	ActionTableLayout,
	FullScreenStack,
	MutedText,
	PageIntro,
	Panel,
	ResponseBlock,
	SectionActions,
	SectionHeader,
	StatusBox,
	TableTitle,
} from "../components/wrappers";
import { InlineButton } from "../components/buttons";
import { FieldGroup as FormFieldGroup, FieldLabel as FormFieldLabel } from "../components/forms";
import { IssuerForm } from "../components/IssuerForm";
import { MintActions } from "../components/MintActions";
import { useMintIssuer } from "../hooks/useMintIssuer";
import { saveLastMintedIssuer } from "../utils/lastMintedIssuer";

export default function MintPage() {
	const mint = useMintIssuer();

	// Clean post-mint success state — heavy management now lives at /manage/cap-table
	if (mint.result) {
		// Persist for /manage to auto-load
		saveLastMintedIssuer(mint.result);

		const manageUrl = `/manage/cap-table?issuerId=${encodeURIComponent(mint.result._id)}`;

		return (
			<FullScreenStack>
				<PageIntro>
					<TableTitle>Cap Table Minted Successfully</TableTitle>
					<MutedText>
						Your new cap table has been deployed and registered. Continue to the cap table manager
						to create stock classes, stakeholders, and issue stock.
					</MutedText>
				</PageIntro>

				<StatusBox $variant="success">
					Your new cap table has been deployed and registered.
				</StatusBox>

				<FormFieldGroup>
					<FormFieldLabel>Issuer ID</FormFieldLabel>
					<ResponseBlock>{mint.result._id}</ResponseBlock>
				</FormFieldGroup>
				<FormFieldGroup>
					<FormFieldLabel>Contract Address</FormFieldLabel>
					<ResponseBlock>{mint.result.deployed_to}</ResponseBlock>
				</FormFieldGroup>
				<FormFieldGroup>
					<FormFieldLabel>Transaction Hash</FormFieldLabel>
					<ResponseBlock>{mint.result.tx_hash}</ResponseBlock>
				</FormFieldGroup>

				<SectionActions>
					<Link href={manageUrl} passHref legacyBehavior>
						<InlineButton as="a" $variant="primary">
							Go to Manage → Create Stock Classes &amp; Issue Stock
						</InlineButton>
					</Link>
					<InlineButton onClick={() => mint.reset()}>Mint Another</InlineButton>
				</SectionActions>

				<MutedText>
					Use the top navigation to switch between Mint and Manage.
				</MutedText>
			</FullScreenStack>
		);
	}

	return (
		<FullScreenStack>
			<PageIntro>
				<P>
					Deploy a new onchain cap table with your wallet. After minting, go to the Dashboard to create
					stock classes, stakeholders, and issue stock.
				</P>
			</PageIntro>

			<ActionTableLayout>
				<Panel>
					<SectionHeader>
						<TableTitle>Issuer Details</TableTitle>
					</SectionHeader>
					<IssuerForm fields={mint.fields} setField={mint.setField} disabled={mint.isBusy} />
				</Panel>

				<Panel>
					<SectionHeader>
						<TableTitle>Mint</TableTitle>
					</SectionHeader>
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
			</ActionTableLayout>
		</FullScreenStack>
	);
}
