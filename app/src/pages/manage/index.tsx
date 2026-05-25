import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { P } from "../../components/typography";
import {
	ActionTableLayout,
	FullScreenStack,
	MutedText,
	PageIntro,
	Panel,
	SectionActions,
	SectionHeader,
	StyledTable,
	TablePanel,
	TableScroll,
	TableTitle,
} from "../../components/wrappers";
import { InlineButton } from "../../components/buttons";
import { FieldGroup, FieldLabel, Input } from "../../components/forms";
import { getLastMintedIssuer, type LastMintedIssuer } from "../../utils/lastMintedIssuer";

const MY_ISSUERS_KEY = "tap_my_issuers";

/**
 * /manage - Management Hub
 *
 * Shows all cap tables the admin wallet has interacted with (minted or manually added).
 * This is the central place to pick which issuer to manage.
 */
export default function ManageHub() {
	const [myIssuers, setMyIssuers] = useState<LastMintedIssuer[]>([]);
	const [newIssuerId, setNewIssuerId] = useState("");
	const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
	const { address: wagmiAddress } = useAccount();
	const [isSyncingIssuers, setIsSyncingIssuers] = useState(false);

	// Load persisted list + last minted
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Load saved list
		try {
			const saved = localStorage.getItem(MY_ISSUERS_KEY);
			const parsed: LastMintedIssuer[] = saved ? JSON.parse(saved) : [];
			setMyIssuers(parsed);
		} catch {
			// Ignore parse errors; the list will fall back to whatever is available below.
		}

		// Always include the most recent mint if it exists
		const last = getLastMintedIssuer();
		if (last) {
			setMyIssuers((prev) => {
				const exists = prev.some((i) => i._id === last._id);
				return exists ? prev : [last, ...prev];
			});
		}
	}, []);

	// Save list whenever it changes
	useEffect(() => {
		if (typeof window === "undefined") return;
		localStorage.setItem(MY_ISSUERS_KEY, JSON.stringify(myIssuers));
	}, [myIssuers]);

	// Track connected address for the "by admin" queries (real wagmi state)
	useEffect(() => {
		if (wagmiAddress) setConnectedAddress(wagmiAddress);
	}, [wagmiAddress]);

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

	// Pull issuers from server that were deployed_by the connected wallet (new capability)
	const syncIssuersFromServer = async () => {
		const addr = wagmiAddress || connectedAddress;
		if (!addr) {
			alert("Connect your admin wallet first (via the top Navbar) to query deployed issuers.");
			return;
		}
		setIsSyncingIssuers(true);
		try {
			const res = await fetch(`/api/issuer/by-deployer/${encodeURIComponent(addr)}`);
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

	return (
		<FullScreenStack>
			<PageIntro>
				<P>
					This is your central hub for all cap tables you have deployed as Admin.
					Your connected wallet can manage any of these.
				</P>
			</PageIntro>

			<ActionTableLayout>
				<Panel>
					<SectionHeader>
						<TableTitle>Add Existing Cap Table</TableTitle>
					</SectionHeader>
					<FieldGroup>
						<FieldLabel>Issuer ID (UUID)</FieldLabel>
						<Input
							type="text"
							value={newIssuerId}
							onChange={(e) => setNewIssuerId(e.target.value)}
							placeholder="Issuer ID (UUID)"
						/>
					</FieldGroup>
					<SectionActions>
						<InlineButton onClick={addIssuer} disabled={!newIssuerId.trim()} $variant="primary">
							Add
						</InlineButton>
						<Link href="/mint" passHref legacyBehavior>
							<InlineButton as="a">+ Mint a New Cap Table</InlineButton>
						</Link>
					</SectionActions>
					<MutedText>
						Paste any issuer ID you have admin rights on.
					</MutedText>
				</Panel>

				<TablePanel>
					<SectionHeader>
						<TableTitle>Your Cap Tables</TableTitle>
						<SectionActions>
							<InlineButton
								onClick={syncIssuersFromServer}
								disabled={isSyncingIssuers || !wagmiAddress}
								title="Query Mongo for issuers where deployed_by matches your connected wallet address"
							>
								{isSyncingIssuers ? "Syncing..." : "Sync from Server"}
							</InlineButton>
						</SectionActions>
					</SectionHeader>

					{myIssuers.length === 0 ? (
						<MutedText>
							No cap tables yet. Mint one on the <a href="/mint">Mint</a> page, or add an existing issuer ID.
						</MutedText>
					) : (
						<TableScroll>
							<StyledTable>
								<thead>
									<tr>
										<th>Cap Table</th>
										<th>Issuer ID</th>
										<th>Contract</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{myIssuers.map((issuer) => (
										<tr key={issuer._id}>
											<td>{issuer.legal_name || "Unnamed Cap Table"}</td>
											<td style={{ fontFamily: "monospace" }}>{issuer._id}</td>
											<td style={{ fontFamily: "monospace" }}>
												{issuer.deployed_to
													? `${issuer.deployed_to.slice(0, 10)}…`
													: "—"}
											</td>
											<td>
												<SectionActions>
													<Link
														href={`/manage/cap-table?issuerId=${issuer._id}`}
														passHref
														legacyBehavior
													>
														<InlineButton as="a" $variant="primary">
															Manage
														</InlineButton>
													</Link>
													<InlineButton
														onClick={() => removeIssuer(issuer._id)}
														$variant="danger"
													>
														Remove
													</InlineButton>
												</SectionActions>
											</td>
										</tr>
									))}
								</tbody>
							</StyledTable>
						</TableScroll>
					)}

					<MutedText>
						Tip: every successful mint is automatically added. Use “Sync from Server” to
						pull in any others deployed by this admin address (requires the deployed_by field
						on recent mints).
					</MutedText>
				</TablePanel>
			</ActionTableLayout>
		</FullScreenStack>
	);
}
