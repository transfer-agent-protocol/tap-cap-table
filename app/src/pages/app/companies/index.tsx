import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { H3, MutedText, P } from "../../../components/typography";
import { Page, Section, SectionHeader } from "../../../components/layout";
import { Button, StatusMessage } from "../../../components/elements";
import { PageHeader } from "../../../components/PageHeader";
import {
	loadMyIssuers,
	mergeIssuers,
	saveMyIssuers,
	type StoredIssuer,
} from "../../../utils/myIssuers";
import { capTableHref } from "../../../components/shell/navConfig";

export interface IssuerSummary {
	people: number;
	peopleOnchain: number;
	classes: number;
	classesOnchain: number;
	classesGhost: number;
	issuances: number;
	readyToIssue: boolean;
	hasPositions: boolean;
}

const StatsRow = styled.div`
	display: flex;
	flex-flow: row wrap;
	gap: ${({ theme }) => theme.spacing.sm};
	align-items: center;
	margin-top: 0.15rem;
`;

const StatChip = styled.span<{ $tone?: "ok" | "warn" | "muted" }>`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.02em;
	padding: 0.15rem 0.45rem;
	border: 1px solid ${({ theme }) => theme.colors.border};
	color: ${({ theme, $tone }) =>
		$tone === "ok" ? theme.colors.accent : theme.colors.textMuted};
	background: transparent;
`;

const IssuerList = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
	width: 100%;
`;

const IssuerCard = styled.div`
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: ${({ theme }) => theme.spacing.md};
	align-items: start;
	padding: ${({ theme }) => theme.spacing.md} 0;
	background: transparent;
	border: none;
	border-top: 1px solid ${({ theme }) => theme.colors.border};

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		grid-template-columns: 1fr;
	}
`;

const IssuerBody = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.sm};
	min-width: 0;
`;

const IssuerName = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text};
`;

const MetaItem = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.2rem;
	min-width: 0;
`;

const MetaLabel = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.textSubtle};
`;

const ContractLink = styled.a`
	display: block;
	font-size: ${({ theme }) => theme.fontSizes.xs} !important;
	line-height: 1.5;
	color: ${({ theme }) => theme.colors.accent} !important;
	word-break: break-all;
	overflow-wrap: anywhere;
	text-decoration: none !important;
	opacity: 1 !important;
	font-family: ${({ theme }) => theme.fonts.mono};
	font-variant-numeric: tabular-nums;

	&:hover {
		text-decoration: underline !important;
	}
`;

const CardActions = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing.sm};
	padding-top: 0.15rem;
`;

/**
 * /app/companies — companies this wallet created (local list + server by-deployer).
 */
export default function ManageHub() {
	const router = useRouter();
	const [myIssuers, setMyIssuers] = useState<StoredIssuer[]>([]);
	const [hydrated, setHydrated] = useState(false);
	const [syncMessage, setSyncMessage] = useState<string | null>(null);
	const [summaries, setSummaries] = useState<Record<string, IssuerSummary>>({});
	const { address: wagmiAddress } = useAccount();
	const { address: appKitAddress } = useAppKitAccount();
	const adminAddress = wagmiAddress || appKitAddress || null;
	const [isSyncingIssuers, setIsSyncingIssuers] = useState(false);

	useEffect(() => {
		setMyIssuers(loadMyIssuers());
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		saveMyIssuers(myIssuers);
	}, [myIssuers, hydrated]);

	const loadSummaries = useCallback(async (ids: string[]) => {
		if (ids.length === 0) {
			setSummaries({});
			return;
		}
		try {
			const res = await fetch("/api/issuer/summaries", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids }),
			});
			if (!res.ok) return;
			const json = await res.json();
			setSummaries(json.summaries || {});
		} catch (e) {
			console.warn("Failed to load issuer summaries", e);
		}
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		void loadSummaries(myIssuers.map((i) => i._id));
	}, [hydrated, myIssuers, loadSummaries]);

	const sortedIssuers = useMemo(() => {
		return [...myIssuers].sort((a, b) => {
			const sa = summaries[a._id];
			const sb = summaries[b._id];
			const score = (s?: IssuerSummary) =>
				(s?.hasPositions ? 4 : 0) +
				(s?.readyToIssue ? 2 : 0) +
				(s?.peopleOnchain || 0) +
				(s?.classesOnchain || 0);
			return score(sb) - score(sa);
		});
	}, [myIssuers, summaries]);

	const removeIssuer = (id: string) => {
		setMyIssuers((prev) => prev.filter((i) => i._id !== id));
	};

	const syncIssuersFromServer = async () => {
		if (!adminAddress) {
			alert("Connect your wallet in the top bar first.");
			return;
		}
		setIsSyncingIssuers(true);
		setSyncMessage(null);
		try {
			const res = await fetch(`/api/issuer/by-deployer/${encodeURIComponent(adminAddress)}`);
			if (!res.ok) {
				setSyncMessage(`Couldn’t reach the server (${res.status}). Try again in a moment.`);
				return;
			}
			const json = await res.json();
			const fromServer: StoredIssuer[] = (json.issuers || []).map((iss: any) => ({
				_id: iss._id,
				legal_name: iss.legal_name || "Cap Table",
				deployed_to: iss.deployed_to || "",
				tx_hash: iss.tx_hash || "",
			}));
			setMyIssuers((prev) => {
				const merged = mergeIssuers(prev, fromServer);
				saveMyIssuers(merged);
				return merged;
			});
			const n = fromServer.length;
			setSyncMessage(
				n === 0
					? "No companies found for this wallet yet."
					: `Loaded ${n} compan${n === 1 ? "y" : "ies"} for this wallet.`,
			);
			await loadSummaries(fromServer.map((i) => i._id).concat(myIssuers.map((i) => i._id)));
		} catch (e) {
			console.error("Failed to sync issuers from server", e);
			setSyncMessage("Couldn’t load companies. Check that the API is running.");
		} finally {
			setIsSyncingIssuers(false);
		}
	};

	const summaryLabel = (s?: IssuerSummary) => {
		if (!s) return null;
		if (s.hasPositions) return { text: "Has holdings", tone: "ok" as const };
		if (s.readyToIssue) return { text: "Ready to issue", tone: "ok" as const };
		if (s.classesGhost > 0) return { text: "Stock class incomplete", tone: "warn" as const };
		if (s.people === 0 && s.classes === 0) return { text: "Empty", tone: "muted" as const };
		return { text: "Setup incomplete", tone: "warn" as const };
	};

	return (
		<Page data-testid="manage-hub">
			<PageHeader
				title="Your companies"
				description={
					<P>
						Cap tables you&apos;ve created. Open one to manage shareholders, stock
						classes, and issuances.
					</P>
				}
				actions={
					<>
						<Button onClick={() => router.push("/app/mint")} $variant="primary">
							New company
						</Button>
						<Button
							onClick={syncIssuersFromServer}
							disabled={isSyncingIssuers || !adminAddress}
							$variant="secondary"
							title="Load companies this wallet deployed"
						>
							{isSyncingIssuers ? "Loading…" : "Load from wallet"}
						</Button>
					</>
				}
			/>

			<Section>
				<SectionHeader>
					<H3>Your list</H3>
				</SectionHeader>

				{syncMessage && (
					<StatusMessage $variant="success">{syncMessage}</StatusMessage>
				)}

				{!hydrated ? (
					<MutedText>Loading…</MutedText>
				) : myIssuers.length === 0 ? (
					<MutedText>
						Nothing here yet. <a href="/app/mint">Create a company</a>
						{adminAddress ? " or load from your connected wallet." : "."}
					</MutedText>
				) : (
					<IssuerList>
						{sortedIssuers.map((issuer) => {
							const s = summaries[issuer._id];
							const badge = summaryLabel(s);
							return (
								<IssuerCard key={issuer._id}>
									<IssuerBody>
										<IssuerName>{issuer.legal_name || "Unnamed company"}</IssuerName>
										{badge && (
											<StatsRow>
												<StatChip $tone={badge.tone}>{badge.text}</StatChip>
												{s && (
													<>
														<StatChip $tone="muted">
															{s.people} shareholder{s.people === 1 ? "" : "s"}
														</StatChip>
														<StatChip $tone={s.classesGhost > 0 ? "warn" : "muted"}>
															{s.classesOnchain}/{s.classes} stock class
															{s.classes === 1 ? "" : "es"}
														</StatChip>
														<StatChip $tone={s.issuances > 0 ? "ok" : "muted"}>
															{s.issuances} issuance{s.issuances === 1 ? "" : "s"}
														</StatChip>
													</>
												)}
											</StatsRow>
										)}
										{issuer.deployed_to && (
											<MetaItem>
												<MetaLabel>Contract</MetaLabel>
												<ContractLink
													href={`https://explorer.plume.org/address/${issuer.deployed_to}`}
													target="_blank"
													rel="noopener noreferrer"
													title="View on explorer"
												>
													{issuer.deployed_to}
												</ContractLink>
											</MetaItem>
										)}
									</IssuerBody>
									<CardActions>
										<Button
											onClick={() => router.push(capTableHref(issuer._id, "overview"))}
											$variant="primary"
										>
											Open
										</Button>
										<Button onClick={() => removeIssuer(issuer._id)} $variant="ghost">
											Remove
										</Button>
									</CardActions>
								</IssuerCard>
							);
						})}
					</IssuerList>
				)}
			</Section>
		</Page>
	);
}
