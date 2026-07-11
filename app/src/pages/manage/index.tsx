import React, { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { Eyebrow, P } from "../../components/typography";
import {
	ActionTableLayout,
	FullScreenStack,
	MutedText,
	PageIntro,
	Panel,
	SectionActions,
	SectionHeader,
	TablePanel,
	TableTitle,
} from "../../components/wrappers";
import { InlineButton } from "../../components/buttons";
import { FieldGroup, FieldLabel, Input } from "../../components/forms";
import { getLastMintedIssuer, type LastMintedIssuer } from "../../utils/lastMintedIssuer";
import { capTableHref } from "../../components/navConfig";

const MY_ISSUERS_KEY = "tap_my_issuers";

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
	align-items: center;
	padding: ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.elevated};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.radii.md};
	transition: border-color ${({ theme }) => theme.transitions.default};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
		grid-template-columns: 1fr;
	}
`;

const IssuerBody = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: ${({ theme }) => theme.spacing.xs};
	min-width: 0;
`;

const IssuerName = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text};
`;

const MetaRow = styled.div`
	display: flex;
	flex-flow: row wrap;
	gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	align-items: baseline;
`;

const MetaItem = styled.div`
	display: flex;
	flex-flow: column nowrap;
	gap: 0.15rem;
	min-width: 0;
`;

const MetaLabel = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.xs};
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: ${({ theme }) => theme.colors.subtle};
`;

/** Neutral mono — never signal green (avoids green-on-green next to Manage CTA) */
const MetaValue = styled.code`
	font-family: inherit;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	color: ${({ theme }) => theme.colors.muted};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.radii.sm};
	padding: 0.2rem 0.45rem;
	word-break: break-all;
`;

const CardActions = styled.div`
	display: flex;
	flex-flow: row wrap;
	align-items: center;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing.sm};
`;

/**
 * /manage — pick an issuer to open the cap table workspace.
 */
export default function ManageHub() {
	const [myIssuers, setMyIssuers] = useState<LastMintedIssuer[]>([]);
	const [newIssuerId, setNewIssuerId] = useState("");
	const { address: wagmiAddress } = useAccount();
	const { address: appKitAddress } = useAppKitAccount();
	const adminAddress = wagmiAddress || appKitAddress || null;
	const [isSyncingIssuers, setIsSyncingIssuers] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			const saved = localStorage.getItem(MY_ISSUERS_KEY);
			const parsed: LastMintedIssuer[] = saved ? JSON.parse(saved) : [];
			setMyIssuers(parsed);
		} catch {
			// ignore
		}

		const last = getLastMintedIssuer();
		if (last) {
			setMyIssuers((prev) => {
				const exists = prev.some((i) => i._id === last._id);
				return exists ? prev : [last, ...prev];
			});
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		localStorage.setItem(MY_ISSUERS_KEY, JSON.stringify(myIssuers));
	}, [myIssuers]);

	const addIssuer = () => {
		const id = newIssuerId.trim();
		if (!id) return;

		const newEntry: LastMintedIssuer = {
			_id: id,
			legal_name: "Manually added",
			deployed_to: "",
			tx_hash: "",
		};

		setMyIssuers((prev) => {
			const exists = prev.some((i) => i._id === id);
			return exists ? prev : [newEntry, ...prev];
		});
		setNewIssuerId("");
	};

	const removeIssuer = (id: string) => {
		setMyIssuers((prev) => prev.filter((i) => i._id !== id));
	};

	const syncIssuersFromServer = async () => {
		if (!adminAddress) {
			alert("Connect your admin wallet in the top bar first.");
			return;
		}
		setIsSyncingIssuers(true);
		try {
			const res = await fetch(`/api/issuer/by-deployer/${encodeURIComponent(adminAddress)}`);
			if (res.ok) {
				const json = await res.json();
				const fromServer: LastMintedIssuer[] = (json.issuers || []).map((iss: any) => ({
					_id: iss._id,
					legal_name: iss.legal_name || "Cap Table",
					deployed_to: iss.deployed_to || "",
					tx_hash: iss.tx_hash || "",
				}));
				setMyIssuers((prev) => {
					const merged = [...prev];
					fromServer.forEach((s) => {
						if (!merged.some((m) => m._id === s._id)) merged.unshift(s);
					});
					return merged;
				});
			} else {
				console.warn("by-deployer returned", res.status);
			}
		} catch (e) {
			console.error("Failed to sync issuers from server", e);
		} finally {
			setIsSyncingIssuers(false);
		}
	};

	const truncate = (addr: string) =>
		addr.length > 14 ? `${addr.slice(0, 8)}…${addr.slice(-4)}` : addr;

	return (
		<FullScreenStack data-testid="manage-hub">
			<PageIntro>
				<Eyebrow>Workspace</Eyebrow>
				<TableTitle style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
					Your cap tables
				</TableTitle>
				<P>
					Issuers you deployed or added. Open one to manage stakeholders, stock classes, and stock
					issuances — onchain writes from your wallet, OCF metadata mirrored offchain.
				</P>
			</PageIntro>

			<ActionTableLayout>
				<Panel>
					<SectionHeader>
						<TableTitle>Add existing issuer</TableTitle>
					</SectionHeader>
					<FieldGroup>
						<FieldLabel>Issuer ID</FieldLabel>
						<Input
							type="text"
							value={newIssuerId}
							onChange={(e) => setNewIssuerId(e.target.value)}
							placeholder="UUID"
						/>
					</FieldGroup>
					<SectionActions>
						<InlineButton onClick={addIssuer} disabled={!newIssuerId.trim()} $variant="primary">
							Add
						</InlineButton>
						<Link href="/mint" passHref legacyBehavior>
							<InlineButton as="a" $variant="secondary">
								Mint new
							</InlineButton>
						</Link>
					</SectionActions>
					<MutedText>Any issuer where your wallet holds ADMIN can be managed here.</MutedText>
				</Panel>

				<TablePanel>
					<SectionHeader>
						<TableTitle>Issuers</TableTitle>
						<SectionActions>
							<InlineButton
								onClick={syncIssuersFromServer}
								disabled={isSyncingIssuers || !adminAddress}
								$variant="secondary"
								title="Load issuers where deployed_by matches your connected wallet"
							>
								{isSyncingIssuers ? "Syncing…" : "Sync from server"}
							</InlineButton>
						</SectionActions>
					</SectionHeader>

					{myIssuers.length === 0 ? (
						<MutedText>
							No issuers yet.{" "}
							<a href="/mint">Mint a cap table</a> or paste an issuer ID.
						</MutedText>
					) : (
						<IssuerList>
							{myIssuers.map((issuer) => (
								<IssuerCard key={issuer._id}>
									<IssuerBody>
										<IssuerName>{issuer.legal_name || "Unnamed issuer"}</IssuerName>
										<MetaRow>
											<MetaItem>
												<MetaLabel>Issuer ID</MetaLabel>
												<MetaValue>{issuer._id}</MetaValue>
											</MetaItem>
											<MetaItem>
												<MetaLabel>Contract</MetaLabel>
												<MetaValue>
													{issuer.deployed_to ? truncate(issuer.deployed_to) : "—"}
												</MetaValue>
											</MetaItem>
										</MetaRow>
									</IssuerBody>
									<CardActions>
										<Link href={capTableHref(issuer._id, "overview")} passHref legacyBehavior>
											<InlineButton as="a" $variant="primary">
												Open
											</InlineButton>
										</Link>
										<InlineButton onClick={() => removeIssuer(issuer._id)} $variant="ghost">
											Remove
										</InlineButton>
									</CardActions>
								</IssuerCard>
							))}
						</IssuerList>
					)}

					<MutedText>
						Successful mints are saved in this browser. Sync from server pulls issuers registered with
						your wallet as <code>deployed_by</code>.
					</MutedText>
				</TablePanel>
			</ActionTableLayout>
		</FullScreenStack>
	);
}
