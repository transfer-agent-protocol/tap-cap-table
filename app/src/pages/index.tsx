import Link from "next/link";
import {
	Content,
	Heading,
	StyledTable,
	SectionActions,
	TableScroll,
	Panel,
	MutedText,
} from "../components/wrappers";
import { H2, P } from "../components/typography";
import { InlineButton } from "../components/buttons";

/**
 * Landing — keep Alex's original voice; only light structure for the new shell.
 */
export default function Home() {
	return (
		<Content data-testid="home-page">
			<Heading>
				<P>Tokenize RWA cap tables and handle post-trade settlment.</P>
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
			</Heading>

			<SectionActions style={{ marginBottom: "2rem", justifyContent: "flex-start" }}>
				<Link href="/mint" passHref legacyBehavior>
					<InlineButton as="a" $variant="primary">
						Mint Cap Table
					</InlineButton>
				</Link>
				<Link href="/manage" passHref legacyBehavior>
					<InlineButton as="a" $variant="secondary">
						Manage Cap Tables
					</InlineButton>
				</Link>
			</SectionActions>

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

			<Panel style={{ padding: 0, overflow: "hidden", marginTop: "0.5rem" }}>
				<TableScroll>
					<StyledTable style={{ border: "none", borderRadius: 0, margin: 0 }}>
						<thead>
							<tr>
								<th>Name</th>
								<th>Address</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>TAP Admin (Dev)</td>
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
								<td>CapTable</td>
								<td>
									<a
										href="https://explorer.plume.org/address/0xef269Cf3696FF8829eD2b003b39889Fd8e6a81Ce?tab=contract"
										target="_blank"
										rel="noopener noreferrer"
									>
										0xef269Cf3696FF8829eD2b003b39889Fd8e6a81Ce
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
					</StyledTable>
				</TableScroll>
			</Panel>

		</Content>
	);
}
