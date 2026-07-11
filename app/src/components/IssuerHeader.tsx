import styled from "styled-components";
import { DashboardHeader, SectionActions } from "./wrappers";
import { InlineButton } from "./buttons";
import type { IssuerResponse } from "../services/registerIssuer";

const IssuerSummary = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
	min-width: 0;
	padding-left: ${({ theme }) => theme.spacing.sm};
	flex: 1;
`;

const IssuerName = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	font-size: ${({ theme }) => theme.fontSizes.H3};
	letter-spacing: -0.03em;
	color: ${({ theme }) => theme.colors.text};
`;

const MetaBlock = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.2rem;
	min-width: 0;
`;

const MetaLabel = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
`;

const MetaCode = styled.code`
	display: block;
	font-family: inherit;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	line-height: 1.45;
	color: ${({ theme }) => theme.colors.muted};
	word-break: break-all;
	overflow-wrap: anywhere;
	user-select: all;
`;

const MetaLink = styled.a`
	display: block;
	font-family: inherit;
	font-size: ${({ theme }) => theme.fontSizes.xs} !important;
	line-height: 1.45;
	color: ${({ theme }) => theme.colors.muted} !important;
	word-break: break-all;
	overflow-wrap: anywhere;
	text-decoration: none !important;
	opacity: 1 !important;

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
		text-decoration: underline !important;
	}
`;

const LiveTag = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.35rem 0.7rem;
	background: ${({ theme }) => theme.colors.successBg};
	color: ${({ theme }) => theme.colors.success};
	border: 1px solid rgba(52, 211, 153, 0.3);
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	border-radius: ${({ theme }) => theme.radii.pill};

	&::before {
		content: "";
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: currentColor;
		box-shadow: 0 0 8px currentColor;
	}
`;

interface IssuerHeaderProps {
	issuer: IssuerResponse | null;
	contractAddress: string | null;
	onReset: () => void;
}

export function IssuerHeader({ issuer, contractAddress, onReset }: IssuerHeaderProps) {
	if (!issuer) return null;

	const explorerBase = "https://explorer.plume.org";
	const contract = contractAddress || issuer.deployed_to || null;

	return (
		<DashboardHeader>
			<IssuerSummary>
				<IssuerName>{issuer.legal_name}</IssuerName>
				<MetaBlock>
					<MetaLabel>Issuer ID</MetaLabel>
					<MetaCode>{issuer._id}</MetaCode>
				</MetaBlock>
				{contract && (
					<MetaBlock>
						<MetaLabel>Contract</MetaLabel>
						<MetaLink
							href={`${explorerBase}/address/${contract}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{contract}
						</MetaLink>
					</MetaBlock>
				)}
			</IssuerSummary>

			<SectionActions>
				<LiveTag>Live</LiveTag>
				<InlineButton onClick={onReset} $variant="secondary">
					Mint another
				</InlineButton>
			</SectionActions>
		</DashboardHeader>
	);
}
