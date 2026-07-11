import styled from "styled-components";
import { DashboardHeader, SectionActions } from "./wrappers";
import { InlineButton } from "./buttons";
import type { IssuerResponse } from "../services/registerIssuer";

const IssuerSummary = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
	min-width: 0;
	flex: 1;
`;

const IssuerName = styled.h2`
	margin: 0;
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	font-size: ${({ theme }) => theme.fontSizes.H3};
	letter-spacing: -0.03em;
	color: ${({ theme }) => theme.colors.text};
`;

const MetaLine = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: baseline;
	gap: ${({ theme }) => theme.spacing.sm};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	line-height: 1.5;
	min-width: 0;
`;

const MetaLabel = styled.span`
	flex-shrink: 0;
	color: ${({ theme }) => theme.colors.subtle};
	text-transform: uppercase;
	letter-spacing: 0.06em;
`;

const MetaValue = styled.span`
	color: ${({ theme }) => theme.colors.muted};
	word-break: break-all;
	overflow-wrap: anywhere;
	user-select: all;
	font-variant-numeric: tabular-nums;
`;

const MetaLink = styled.a`
	color: ${({ theme }) => theme.colors.main} !important;
	word-break: break-all;
	overflow-wrap: anywhere;
	text-decoration: none !important;
	opacity: 1 !important;

	&:hover {
		text-decoration: underline !important;
	}
`;

const LiveTag = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.success};

	&::before {
		content: "";
		width: 0.35rem;
		height: 0.35rem;
		border-radius: 50%;
		background: currentColor;
	}
`;

interface IssuerHeaderProps {
	issuer: IssuerResponse | null;
	contractAddress: string | null;
	onReset: () => void;
}

export function IssuerHeader({ issuer, contractAddress, onReset }: IssuerHeaderProps) {
	if (!issuer) return null;

	const contract = contractAddress || issuer.deployed_to || null;

	return (
		<DashboardHeader>
			<IssuerSummary>
				<IssuerName>{issuer.legal_name}</IssuerName>
				<MetaLine>
					<MetaLabel>ID</MetaLabel>
					<MetaValue>{issuer._id}</MetaValue>
				</MetaLine>
				{contract && (
					<MetaLine>
						<MetaLabel>Contract</MetaLabel>
						<MetaLink
							href={`https://explorer.plume.org/address/${contract}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{contract}
						</MetaLink>
					</MetaLine>
				)}
			</IssuerSummary>

			<SectionActions>
				<LiveTag>Live</LiveTag>
				<InlineButton onClick={onReset} $variant="ghost">
					Mint another
				</InlineButton>
			</SectionActions>
		</DashboardHeader>
	);
}
