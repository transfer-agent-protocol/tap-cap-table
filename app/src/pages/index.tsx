import { ContentColumn, Section, Stack } from "../components/layout";
import { Table, TableFrame } from "../components/elements";
import { H1, H2, P } from "../components/typography";

/**
 * Landing — marketing only (no product entry until API is public).
 * Demo contract addresses stay for transparency.
 */
export default function Home() {
	return (
		<ContentColumn data-testid="home-page">
			<Stack $gap="2xl">
			<Stack $gap="md">
				<H1>Tokenize RWA cap tables and handle post-trade settlement.</H1>
				<P>
					Fully onchain protocol that&apos;s based on{" "}
					<a href="https://www.opencaptablecoalition.com/" target="_blank" rel="noopener noreferrer">
						Open Cap Table
					</a>{" "}
					data format. We&apos;re being used by SEC-registered transfer agents.
				</P>
				<a
					href="https://paragraph.com/@thatalexpalmer/rwa-tokenization-protocol-stack-1"
					target="_blank"
					rel="noopener noreferrer"
				>
					Read how this started
				</a>
			</Stack>
			<Section>

			<H2>Demo contracts:</H2>
			<P>
				Main implementation is being developed on{" "}
				<a href="https://plume.org" target="_blank" rel="noopener noreferrer">
					Plume
				</a>{" "}
				by{" "}
				<a href="https://x.com/thatalexpalmer" target="_blank" rel="noopener noreferrer">
					@thatalexpalmer
				</a>{" "}
				and will power{" "}
				<a
					href="https://plume.org/blog/plume-earns-sec-approval-as-transfer-agent"
					target="_blank"
					rel="noopener noreferrer"
				>
					Plume&apos;s transfer agent.
				</a>{" "}
				<a href="https://docs.transferagentprotocol.xyz" target="_blank" rel="noopener noreferrer">
					Read our docs.
				</a>
			</P>

			<TableFrame>
				<Table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Address</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>TAP Admin / factory owner (demo)</td>
							<td>
								<a href="https://explorer.plume.org/address/0x366aA809015061C101983900d0c2ebf7d71B96AF">
									0x366aA809015061C101983900d0c2ebf7d71B96AF
								</a>
							</td>
						</tr>
						<tr>
							<td>CapTableFactory</td>
							<td>
								<a
									href="https://explorer.plume.org/address/0xcd6Df14406b0569ceEABa884A18717774EdeaCA1?tab=contract"
									target="_blank"
									rel="noopener noreferrer"
								>
									0xcd6Df14406b0569ceEABa884A18717774EdeaCA1
								</a>
							</td>
						</tr>
						<tr>
							<td>CapTable (beacon impl)</td>
							<td>
								<a
									href="https://explorer.plume.org/address/0xB63C08eF002E5Da7C894168a01790836049C8ff3?tab=contract"
									target="_blank"
									rel="noopener noreferrer"
								>
									0xB63C08eF002E5Da7C894168a01790836049C8ff3
								</a>
							</td>
						</tr>
						<tr>
							<td>StockLib</td>
							<td>
								<a
									href="https://explorer.plume.org/address/0x1cc50D34D02E6fB3c6aa3f164A9D694d69B8ee76?tab=contract"
									target="_blank"
									rel="noopener noreferrer"
								>
									0x1cc50D34D02E6fB3c6aa3f164A9D694d69B8ee76
								</a>
							</td>
						</tr>
						<tr>
							<td>Adjustment</td>
							<td>
								<a
									href="https://explorer.plume.org/address/0x0a1A962cAb45d7094901339Aa7A259024600B74d?tab=contract"
									target="_blank"
									rel="noopener noreferrer"
								>
									0x0a1A962cAb45d7094901339Aa7A259024600B74d
								</a>
							</td>
						</tr>
						<tr>
							<td>DeleteContext</td>
							<td>
								<a
									href="https://explorer.plume.org/address/0xB566e7AF2d86afD192A14f883f3733ab1cB0DB62?tab=contract"
									target="_blank"
									rel="noopener noreferrer"
								>
									0xB566e7AF2d86afD192A14f883f3733ab1cB0DB62
								</a>
							</td>
						</tr>
					</tbody>
				</Table>
			</TableFrame>
			</Section>
			</Stack>
		</ContentColumn>
	);
}
