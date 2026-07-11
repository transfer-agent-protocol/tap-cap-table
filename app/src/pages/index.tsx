import Link from "next/link";
import styled from "styled-components";
import {
	Content,
	Heading,
	StyledTable,
	SectionActions,
	Panel,
	TableScroll,
	MutedText,
} from "../components/wrappers";
import { H1, H2, P, Eyebrow } from "../components/typography";
import { InlineButton } from "../components/buttons";

const Hero = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.lg};
	margin-bottom: ${({ theme }) => theme.spacing["3xl"]};
	max-width: 48rem;
`;

const HeroLead = styled.p`
	margin: 0;
	max-width: 36rem;
	font-size: ${({ theme }) => theme.fontSizes.large};
	line-height: 1.55;
	color: ${({ theme }) => theme.colors.muted};
	letter-spacing: -0.015em;
`;

const FeatureGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: ${({ theme }) => theme.spacing.md};
	margin-bottom: ${({ theme }) => theme.spacing["2xl"]};

	@media (max-width: ${({ theme }) => theme.breakpoints.mintCollapse}) {
		grid-template-columns: 1fr;
	}
`;

const FeatureCard = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
	padding: ${({ theme }) => theme.spacing.lg};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.radii.md};
	transition: border-color ${({ theme }) => theme.transitions.default},
		transform ${({ theme }) => theme.transitions.default},
		box-shadow ${({ theme }) => theme.transitions.default};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
		transform: translateY(-2px);
		box-shadow: ${({ theme }) => theme.shadows.md};
	}
`;

const FeatureIndex = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.1em;
	color: ${({ theme }) => theme.colors.main};
`;

const FeatureTitle = styled.h3`
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text};
`;

const FeatureBody = styled.p`
	margin: 0;
	font-size: ${({ theme }) => theme.fontSizes.small};
	line-height: 1.55;
	color: ${({ theme }) => theme.colors.muted};
`;

const ContractsBlock = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.md};
`;

export default function Home() {
	return (
		<Content data-testid="home-page">
			<Hero>
				<Eyebrow>Transfer Agent Protocol</Eyebrow>
				<H1>Equity ledgers that settle onchain.</H1>
				<HeroLead>
					Mint OCF-native cap tables, issue stock, and manage stakeholders with your wallet —
					no spreadsheet middleman. Built for SEC-registered transfer agents and RWA issuers.
				</HeroLead>
				<SectionActions style={{ justifyContent: "flex-start" }}>
					<Link href="/mint" passHref legacyBehavior>
						<InlineButton as="a" $variant="primary">
							Mint Cap Table
						</InlineButton>
					</Link>
					<Link href="/manage" passHref legacyBehavior>
						<InlineButton as="a" $variant="secondary">
							Open Manager
						</InlineButton>
					</Link>
				</SectionActions>
			</Hero>

			<FeatureGrid>
				<FeatureCard>
					<FeatureIndex>01</FeatureIndex>
					<FeatureTitle>Deploy issuer</FeatureTitle>
					<FeatureBody>
						Wallet-signed factory mint. Legal name, formation, and authorized shares go onchain in one
						flow.
					</FeatureBody>
				</FeatureCard>
				<FeatureCard>
					<FeatureIndex>02</FeatureIndex>
					<FeatureTitle>Define structure</FeatureTitle>
					<FeatureBody>
						Create stock classes and stakeholders as OCF objects — IDs, caps, and relationships
						preserved.
					</FeatureBody>
				</FeatureCard>
				<FeatureCard>
					<FeatureIndex>03</FeatureIndex>
					<FeatureTitle>Issue & track</FeatureTitle>
					<FeatureBody>
						Issue stock with share-cap checks, then browse holdings and historical transactions as
						the poller syncs.
					</FeatureBody>
				</FeatureCard>
			</FeatureGrid>

			<ContractsBlock>
				<Heading>
					<H2>Reference deployments</H2>
					<P>
						Primary implementation runs on{" "}
						<a href="https://plume.org" target="_blank" rel="noopener noreferrer">
							Plume
						</a>
						. Addresses below are for inspection — always verify factory config in your environment.
					</P>
				</Heading>
				<Panel style={{ padding: 0, overflow: "hidden" }}>
					<TableScroll>
						<StyledTable style={{ border: "none", borderRadius: 0 }}>
							<thead>
								<tr>
									<th>Contract</th>
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
							</tbody>
						</StyledTable>
					</TableScroll>
				</Panel>
				<MutedText>
					Read the origin story →{" "}
					<a
						href="https://paragraph.com/@thatalexpalmer/rwa-tokenization-protocol-stack-1"
						target="_blank"
						rel="noopener noreferrer"
					>
						RWA tokenization protocol stack
					</a>
				</MutedText>
			</ContractsBlock>
		</Content>
	);
}
