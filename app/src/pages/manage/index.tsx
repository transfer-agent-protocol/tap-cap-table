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
	StatusBox,
} from "../../components/wrappers";
import { InlineButton } from "../../components/buttons";
import { FieldGroup, FieldLabel, Input } from "../../components/forms";
import {
	loadMyIssuers,
	mergeIssuers,
	saveMyIssuers,
	type StoredIssuer,
} from "../../utils/myIssuers";
import { capTableHref } from "../../components/navConfig";

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
	color: ${({ theme }) => theme.colors.subtle};
`;

/** Full-width mono values — never truncate addresses */
const MetaValue = styled.code`
	display: block;
	font-family: inherit;
	font-size: ${({ theme }) => theme.fontSizes.xs};
	line-height: 1.45;
	color: ${({ theme }) => theme.colors.muted};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.radii.sm};
	padding: 0.35rem 0.5rem;
	word-break: break-all;
	overflow-wrap: anywhere;
	user-select: all;
`;

const ContractLink = styled.a`
	display: block;
	font-family: inherit;
	font-size: ${({ theme }) => theme.fontSizes.xs} !important;
	line-height: 1.45;
	color: ${({ theme }) => theme.colors.muted} !important;
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.outline};
	border-radius: ${({ theme }) => theme.radii.sm};
	padding: 0.35rem 0.5rem;
	word-break: break-all;
	overflow-wrap: anywhere;
	text-decoration: none !important;
	opacity: 1 !important;

	&:hover {
		color: ${({ theme }) => theme.colors.main} !important;
		border-color: ${({ theme }) => theme.colors.borderStrong};
		text-decoration: none !important;
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
 * /manage — pick a company cap table to work on.
 */
export default function ManageHub() {
	const [myIssuers, setMyIssuers] = useState<StoredIssuer[]>([]);
	const [hydrated, setHydrated] = useState(false);
	const [newIssuerId, setNewIssuerId] = useState("");
	const [syncMessage, setSyncMessage] = useState<string | null>(null);
	const { address: wagmiAddress } = useAccount();
	const { address: appKitAddress } = useAppKitAccount();
	const adminAddress = wagmiAddress || appKitAddress || null;
	const [isSyncingIssuers, setIsSyncingIssuers] = useState(false);

	// Load once — never write [] before this finishes (that wiped synced lists).
	useEffect(() => {
		setMyIssuers(loadMyIssuers());
		setHydrated(true);
	}, []);

	// Persist only after hydrate so the initial empty state does not clobber storage.
	useEffect(() => {
		if (!hydrated) return;
		saveMyIssuers(myIssuers);
	}, [myIssuers, hydrated]);

	const addIssuer = () => {
		const id = newIssuerId.trim();
		if (!id) return;

		const newEntry: StoredIssuer = {
			_id: id,
			legal_name: "Added manually",
			deployed_to: "",
			tx_hash: "",
		};

		setMyIssuers((prev) => mergeIssuers(prev, [newEntry]));
		setNewIssuerId("");
		setSyncMessage(null);
	};

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
				// Explicit save so a fast navigation still keeps the sync result
				saveMyIssuers(merged);
				return merged;
			});
			const n = fromServer.length;
			setSyncMessage(
				n === 0
					? "No cap tables found for this wallet on the server yet."
					: `Saved ${n} cap table${n === 1 ? "" : "s"} from the server to this browser.`,
			);
		} catch (e) {
			console.error("Failed to sync issuers from server", e);
			setSyncMessage("Sync failed. Check that the API is running and try again.");
		} finally {
			setIsSyncingIssuers(false);
		}
	};

	return (
		<FullScreenStack data-testid="manage-hub">
			<PageIntro>
				<Eyebrow>Cap tables</Eyebrow>
				<TableTitle style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}>
					Your companies
				</TableTitle>
				<P>
					Every cap table you&apos;ve minted or added. Pick one to add people, create share classes,
					and issue stock.
				</P>
			</PageIntro>

			<ActionTableLayout>
				<Panel>
					<SectionHeader>
						<TableTitle>Add an existing one</TableTitle>
					</SectionHeader>
					<FieldGroup>
						<FieldLabel>Issuer ID</FieldLabel>
						<Input
							type="text"
							value={newIssuerId}
							onChange={(e) => setNewIssuerId(e.target.value)}
							placeholder="Paste issuer ID"
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
					<MutedText>Use this if you already have an issuer ID from a previous deploy.</MutedText>
				</Panel>

				<TablePanel>
					<SectionHeader>
						<TableTitle>Your list</TableTitle>
						<SectionActions>
							<InlineButton
								onClick={syncIssuersFromServer}
								disabled={isSyncingIssuers || !adminAddress}
								$variant="secondary"
								title="Load cap tables your wallet deployed and keep them in this browser"
							>
								{isSyncingIssuers ? "Syncing…" : "Sync from server"}
							</InlineButton>
						</SectionActions>
					</SectionHeader>

					{syncMessage && (
						<StatusBox $variant="success" style={{ marginBottom: 0 }}>
							{syncMessage}
						</StatusBox>
					)}

					{!hydrated ? (
						<MutedText>Loading…</MutedText>
					) : myIssuers.length === 0 ? (
						<MutedText>
							Nothing here yet.{" "}
							<a href="/mint">Mint a cap table</a>, paste an issuer ID, or sync after connecting your
							wallet.
						</MutedText>
					) : (
						<IssuerList>
							{myIssuers.map((issuer) => (
								<IssuerCard key={issuer._id}>
									<IssuerBody>
										<IssuerName>{issuer.legal_name || "Unnamed company"}</IssuerName>
										<MetaItem>
											<MetaLabel>Issuer ID</MetaLabel>
											<MetaValue>{issuer._id}</MetaValue>
										</MetaItem>
										<MetaItem>
											<MetaLabel>Contract</MetaLabel>
											{issuer.deployed_to ? (
												<ContractLink
													href={`https://explorer.plume.org/address/${issuer.deployed_to}`}
													target="_blank"
													rel="noopener noreferrer"
													title="View on explorer"
												>
													{issuer.deployed_to}
												</ContractLink>
											) : (
												<MetaValue>—</MetaValue>
											)}
										</MetaItem>
									</IssuerBody>
									<CardActions>
										<Link href={capTableHref(issuer._id, "overview")} passHref legacyBehavior>
											<InlineButton as="a" $variant="primary">
												Manage
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
						This list is saved in your browser. Syncing pulls companies your connected wallet has
						deployed and keeps them here for next time.
					</MutedText>
				</TablePanel>
			</ActionTableLayout>
		</FullScreenStack>
	);
}
