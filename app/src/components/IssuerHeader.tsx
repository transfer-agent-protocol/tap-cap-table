import { useState } from "react";
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

const DetailsToggle = styled.button`
	background: none;
	border: none;
	padding: 0;
	font: inherit;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.subtle};
	cursor: pointer;
	text-align: left;

	&:hover {
		color: ${({ theme }) => theme.colors.main};
	}
`;

const DetailsBlock = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.35rem;
	margin-top: 0.25rem;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.muted};
	font-variant-numeric: tabular-nums;
	word-break: break-all;
`;

interface IssuerHeaderProps {
	issuer: IssuerResponse | null;
	contractAddress: string | null;
	onReset: () => void;
}

export function IssuerHeader({ issuer, contractAddress, onReset }: IssuerHeaderProps) {
	const [showDetails, setShowDetails] = useState(false);

	if (!issuer) return null;

	const contract = contractAddress || issuer.deployed_to || null;
	const hasContract = !!contract && String(contract).startsWith("0x");

	return (
		<DashboardHeader>
			<IssuerSummary>
				<IssuerName>{issuer.legal_name}</IssuerName>
				<MetaLine>
					{hasContract ? <LiveTag>Onchain</LiveTag> : <LiveTag style={{ color: "inherit", opacity: 0.6 }}>No contract</LiveTag>}
					{hasContract && (
						<MetaLink
							href={`https://explorer.plume.org/address/${contract}`}
							target="_blank"
							rel="noopener noreferrer"
							title={contract}
						>
							View contract
						</MetaLink>
					)}
					<DetailsToggle
						type="button"
						onClick={() => setShowDetails((v) => !v)}
						aria-expanded={showDetails}
					>
						{showDetails ? "Hide details" : "Details"}
					</DetailsToggle>
				</MetaLine>
				{showDetails && (
					<DetailsBlock>
						<div>
							<span style={{ opacity: 0.7 }}>Company ID · </span>
							{issuer._id}
						</div>
						{contract && (
							<div>
								<span style={{ opacity: 0.7 }}>Contract · </span>
								{contract}
							</div>
						)}
					</DetailsBlock>
				)}
			</IssuerSummary>

			<SectionActions>
				<InlineButton onClick={onReset} $variant="ghost" title="Deploy a different company">
					New company
				</InlineButton>
			</SectionActions>
		</DashboardHeader>
	);
}
