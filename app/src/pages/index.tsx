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
						<td><a href="https://explorer.plume.org/address/0x6beab9e8d8ce97c30912f74e3b74c73ba667960f?tab=contract" target="_blank" rel="noopener noreferrer">0x6bEAb9E8D8CE97c30912F74e3b74C73BA667960f</a></td>
					</tr>
					<tr>
						<td>CapTable</td>
						<td><a href="https://explorer.plume.org/address/0xa5b1c8743ce200986a2d330c4029a28a3f2c02cf?tab=contract" target="_blank" rel="noopener noreferrer">0xa5B1C8743cE200986a2d330C4029a28a3F2c02cF</a></td>
					</tr>
					<tr>
						<td>StockLib</td>
						<td><a href="https://explorer.plume.org/address/0x93b1ba66588fdb991ef9936faf0433f247136942?tab=contract" target="_blank" rel="noopener noreferrer">0x93B1bA66588fdB991eF9936FaF0433f247136942</a></td>
					</tr>
					<tr>
						<td>Adjustment</td>
						<td><a href="https://explorer.plume.org/address/0x5839d9a42b720d101ccbdcba56809cb86894a233?tab=contract" target="_blank" rel="noopener noreferrer">0x5839d9A42B720d101CcbDcba56809cb86894a233</a></td>
					</tr>
					<tr>
						<td>DeleteContext</td>
						<td><a href="https://explorer.plume.org/address/0x0707b4d24255109d323e29fa0fb3a93ecdae58cf?tab=contract" target="_blank" rel="noopener noreferrer">0x0707b4d24255109d323E29Fa0fB3A93ecdAE58Cf</a></td>
					</tr>
				</tbody>
			</StyledTable>
		</Content>
	);
}
