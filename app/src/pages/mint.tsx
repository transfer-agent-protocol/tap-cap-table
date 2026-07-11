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
import { loadMyIssuers, mergeIssuers, saveMyIssuers } from "../utils/myIssuers";

export default function MintPage() {
	const mint = useMintIssuer();

	if (mint.result) {
		saveLastMintedIssuer(mint.result);
		// Keep Manage list in sync with successful mints
		try {
			const merged = mergeIssuers(loadMyIssuers(), [
				{
					_id: mint.result._id,
					legal_name: mint.result.legal_name,
					deployed_to: mint.result.deployed_to,
					tx_hash: mint.result.tx_hash,
				},
			]);
			saveMyIssuers(merged);
		} catch {
			// ignore storage errors
		}

		const manageUrl = `/manage/cap-table?issuerId=${encodeURIComponent(mint.result._id)}`;

		return (
			<FullScreenStack>
				<PageIntro>
					<Eyebrow>Done</Eyebrow>
					<TableTitle style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
						Your cap table is live
					</TableTitle>
					<MutedText>
						The company is deployed onchain. Next: add people, set up share classes, and issue stock.
					</MutedText>
				</PageIntro>

				<StatusBox $variant="success">Deployed successfully.</StatusBox>

				<FormFieldGroup>
					<FormFieldLabel>Issuer ID</FormFieldLabel>
					<ResponseBlock>{mint.result._id}</ResponseBlock>
				</FormFieldGroup>
				<FormFieldGroup>
					<FormFieldLabel>Contract</FormFieldLabel>
					<ResponseBlock>{mint.result.deployed_to}</ResponseBlock>
				</FormFieldGroup>
				<FormFieldGroup>
					<FormFieldLabel>Transaction</FormFieldLabel>
					<ResponseBlock>{mint.result.tx_hash}</ResponseBlock>
				</FormFieldGroup>

				<SectionActions>
					<Link href={manageUrl} passHref legacyBehavior>
						<InlineButton as="a" $variant="primary">
							Manage this cap table
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
				<Eyebrow>Mint</Eyebrow>
				<TableTitle style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
					Create a new cap table
				</TableTitle>
				<P>
					Fill in the company details and confirm with your wallet. You&apos;ll be the admin of this
					cap table.
				</P>
			</PageIntro>

			<ActionTableLayout>
				<Panel>
					<SectionHeader>
						<TableTitle>Company details</TableTitle>
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
