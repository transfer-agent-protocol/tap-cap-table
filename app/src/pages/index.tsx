import Link from "next/link";
import { Heading, Content, StyledTable } from "../components/wrappers";
import { H1, H2, P } from "../components/typography";

export default function Home() {
	return (
		<Content>
			<Heading>
				<H1>Onchain cap tables.</H1>
				<P>Tokenize RWAs, and handle post-trade settlement.</P>
				<P>Based on the <a href="https://www.opencaptablecoalition.com/" target="_blank">Open Cap Table</a> data format, transfer agent protocol is being used by SEC-registered entities.</P>
				<a href="https://paragraph.com/@thatalexpalmer/rwa-tokenization-protocol-stack-1" target="_blank" rel="noopener">Read why this exists</a>
				
			</Heading>
			<H2>
				Demo Deployments:
			</H2>
			<P>
				Main implementation is being developed on <a href="https://plume.org" target="_blank">Plume</a> by <a href="https://palmer.earth" target="_blank">thatalexpalmer.eth</a> and will power <a href="https://plume.org/blog/plume-earns-sec-approval-as-transfer-agent" target="_blank">Plume's transfer agent.</a> Documentation is being updated.
			</P>
			<StyledTable>
				<thead>
					<tr>
						<th>Name</th>
						<th>Address</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>TAP Admin (Dev)</td>
						<td><a href="https://explorer.plume.org/address/0x366aA809015061C101983900d0c2ebf7d71B96AF">0x366aA809015061C101983900d0c2ebf7d71B96AF</a></td>
					</tr>
					<tr>
						<td>CapTableFactory</td>
						<td><a href="https://explorer.plume.org/address/0xcd6Df14406b0569ceEABa884A18717774EdeaCA1?tab=contract" target="_blank" rel="noopener noreferrer">0xcd6Df14406b0569ceEABa884A18717774EdeaCA1</a></td>
					</tr>
					<tr>
						<td>CapTable</td>
						<td><a href="https://explorer.plume.org/address/0xef269Cf3696FF8829eD2b003b39889Fd8e6a81Ce?tab=contract" target="_blank" rel="noopener noreferrer">0xef269Cf3696FF8829eD2b003b39889Fd8e6a81Ce</a></td>
					</tr>
					<tr>
						<td>StockLib</td>
						<td><a href="https://explorer.plume.org/address/0x1cc50D34D02E6fB3c6aa3f164A9D694d69B8ee76?tab=contract" target="_blank" rel="noopener noreferrer">0x1cc50D34D02E6fB3c6aa3f164A9D694d69B8ee76</a></td>
					</tr>
					<tr>
						<td>Adjustment</td>
						<td><a href="https://explorer.plume.org/address/0x0a1A962cAb45d7094901339Aa7A259024600B74d?tab=contract" target="_blank" rel="noopener noreferrer">0x0a1A962cAb45d7094901339Aa7A259024600B74d</a></td>
					</tr>
					<tr>
						<td>DeleteContext</td>
						<td><a href="https://explorer.plume.org/address/0xB566e7AF2d86afD192A14f883f3733ab1cB0DB62?tab=contract" target="_blank" rel="noopener noreferrer">0xB566e7AF2d86afD192A14f883f3733ab1cB0DB62</a></td>
					</tr>
				</tbody>
			</StyledTable>
		</Content>
	);
}
