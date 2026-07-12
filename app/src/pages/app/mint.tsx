import { useRouter } from "next/router";
import { Eyebrow, H3, MutedText, P } from "../../components/typography";
import { Grid, Page, SectionActions, SectionHeader, Stack } from "../../components/layout";
import { Button, Panel, ResponseBlock, StatusMessage } from "../../components/elements";
import { Field, FieldLabel } from "../../components/forms";
import { PageHeader } from "../../components/PageHeader";
import { IssuerForm } from "../../components/cap-table/forms/IssuerForm";
import { MintActions } from "../../components/cap-table/forms/MintActions";
import { useMintIssuer } from "../../hooks/useMintIssuer";
import { saveLastMintedIssuer } from "../../utils/lastMintedIssuer";
import { loadMyIssuers, mergeIssuers, saveMyIssuers } from "../../utils/myIssuers";
import { capTableHref } from "../../components/shell/navConfig";

/**
 * /app/mint — create a new onchain company cap table.
 */
export default function AppMintPage() {
	const router = useRouter();
	const mint = useMintIssuer();

	if (mint.result) {
		saveLastMintedIssuer(mint.result);
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

		const companyUrl = capTableHref(mint.result._id, "overview");

		return (
			<Page>
				<Stack $gap="sm">
					<Eyebrow>Done</Eyebrow>
					<H3>Your cap table is live</H3>
					<MutedText>
						Next: create a stock class, add shareholders, then issue stock.
					</MutedText>
				</Stack>

				<StatusMessage $variant="success">Company deployed successfully.</StatusMessage>

				<Stack $gap="md">
					<Field>
						<FieldLabel>Company ID</FieldLabel>
						<ResponseBlock>{mint.result._id}</ResponseBlock>
					</Field>
					<Field>
						<FieldLabel>Contract</FieldLabel>
						<ResponseBlock>{mint.result.deployed_to}</ResponseBlock>
					</Field>
					<Field>
						<FieldLabel>Transaction</FieldLabel>
						<ResponseBlock>{mint.result.tx_hash}</ResponseBlock>
					</Field>
				</Stack>

				<SectionActions>
					<Button onClick={() => router.push(companyUrl)} $variant="primary">
						Open company
					</Button>
					<Button onClick={() => router.push("/app/companies")} $variant="secondary">
						All companies
					</Button>
					<Button onClick={() => mint.reset()} $variant="ghost">
						Create another
					</Button>
				</SectionActions>
			</Page>
		);
	}

	return (
		<Page>
			<PageHeader
				title="Create a new cap table"
				description={
					<P>
						Enter company details and confirm with your wallet. You&apos;ll be the admin
						of this cap table.
					</P>
				}
			/>

			<Grid $columns="minmax(18rem, 30rem) minmax(0, 1fr)">
				<Panel>
					<SectionHeader>
						<H3>Company details</H3>
					</SectionHeader>
					<IssuerForm fields={mint.fields} setField={mint.setField} disabled={mint.isBusy} />
				</Panel>

				<Panel>
					<SectionHeader>
						<H3>Deploy</H3>
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
			</Grid>
		</Page>
	);
}
