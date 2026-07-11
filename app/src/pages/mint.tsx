import Link from "next/link";
import { Eyebrow, P } from "../components/typography";
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
					<Eyebrow>Deploy complete</Eyebrow>
					<TableTitle style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
						Cap table is live
					</TableTitle>
					<MutedText>
						Factory deployed the CapTable onchain and the API registered OCF issuer metadata. Next:
						stock classes, stakeholders, then issue stock.
					</MutedText>
				</PageIntro>

				<StatusBox $variant="success">Onchain deploy + offchain registration succeeded.</StatusBox>

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
							Open cap table
						</InlineButton>
					</Link>
					<InlineButton onClick={() => mint.reset()} $variant="secondary">
						Mint another
					</InlineButton>
				</SectionActions>
			</FullScreenStack>
		);
	}

	return (
		<FullScreenStack>
			<PageIntro>
				<Eyebrow>Factory mint</Eyebrow>
				<TableTitle style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
					Deploy a new issuer
				</TableTitle>
				<P>
					Wallet-signs CapTableFactory.createCapTable. Your wallet becomes ADMIN. After the receipt,
					OCF issuer fields are stored offchain for the manage workspace.
				</P>
			</PageIntro>

			<ActionTableLayout>
				<Panel>
					<SectionHeader>
						<TableTitle>Issuer (OCF)</TableTitle>
					</SectionHeader>
					<IssuerForm fields={mint.fields} setField={mint.setField} disabled={mint.isBusy} />
				</Panel>

				<Panel>
					<SectionHeader>
						<TableTitle>Deploy</TableTitle>
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
