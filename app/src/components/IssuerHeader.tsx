import styled from "styled-components";
import { DashboardHeader, SectionActions } from "./wrappers";
import { InlineButton } from "./buttons";
import type { IssuerResponse } from "../services/registerIssuer";

const IssuerSummary = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
	min-width: 0;
`;

const IssuerName = styled.div`
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	font-size: ${({ theme }) => theme.fontSizes.medium};
`;

const IssuerMeta = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.small};
	opacity: 0.7;
`;

const MintedTag = styled.span`
	display: inline-flex;
	align-items: center;
	padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
	background: ${({ theme }) => theme.colors.success};
	color: ${({ theme }) => theme.colors.background};
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	border-radius: ${({ theme }) => theme.radii.sm};
`;

interface IssuerHeaderProps {
	issuer: IssuerResponse | null;
	contractAddress: string | null;
	onReset: () => void;
}

export function IssuerHeader({ issuer, contractAddress, onReset }: IssuerHeaderProps) {
	if (!issuer) return null;

	const explorerBase = "https://explorer.plume.org"; // TODO: make chain-aware later if needed

	return (
		<DashboardHeader>
			<IssuerSummary>
				<IssuerName>{issuer.legal_name}</IssuerName>
				<IssuerMeta>
					Issuer ID: <code>{issuer._id}</code>
				</IssuerMeta>
				{contractAddress && (
					<IssuerMeta>
						Contract:{" "}
						<a href={`${explorerBase}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer">
							{contractAddress.slice(0, 10)}…{contractAddress.slice(-6)}
						</a>
					</IssuerMeta>
				)}
			</IssuerSummary>

			<SectionActions>
				<MintedTag>MINTED</MintedTag>
				<InlineButton onClick={onReset} $variant="primary">
					Mint Another
				</InlineButton>
			</SectionActions>
		</DashboardHeader>
	);
}
