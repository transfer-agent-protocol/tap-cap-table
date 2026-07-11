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
`;

const IssuerName = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	font-size: ${({ theme }) => theme.fontSizes.H3};
	letter-spacing: -0.03em;
	color: ${({ theme }) => theme.colors.text};
`;

const IssuerMeta = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.small};
	color: ${({ theme }) => theme.colors.muted};
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm};

	code {
		font-size: 0.85em;
	}

	a {
		color: ${({ theme }) => theme.colors.main};
	}
`;

const MetaLabel = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
	margin-right: 0.35rem;
`;

const MintedTag = styled.span`
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

	return (
		<DashboardHeader>
			<IssuerSummary>
				<IssuerName>{issuer.legal_name}</IssuerName>
				<IssuerMeta>
					<span>
						<MetaLabel>Issuer</MetaLabel>
						<code>{issuer._id}</code>
					</span>
				</IssuerMeta>
				{contractAddress && (
					<IssuerMeta>
						<span>
							<MetaLabel>Contract</MetaLabel>
							<a
								href={`${explorerBase}/address/${contractAddress}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								{contractAddress.slice(0, 10)}…{contractAddress.slice(-6)}
							</a>
						</span>
					</IssuerMeta>
				)}
			</IssuerSummary>

			<SectionActions>
				<MintedTag>Live</MintedTag>
				<InlineButton onClick={onReset} $variant="secondary">
					Mint Another
				</InlineButton>
			</SectionActions>
		</DashboardHeader>
	);
}
