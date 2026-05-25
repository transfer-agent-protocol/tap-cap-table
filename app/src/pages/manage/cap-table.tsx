import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { P } from "../../components/typography";
import { FullScreenStack, PageIntro } from "../../components/wrappers";
import { CapTableDashboard } from "../../components/CapTableDashboard";
import type { IssuerResponse } from "../../services/registerIssuer";
import { getLastMintedIssuer, type LastMintedIssuer } from "../../utils/lastMintedIssuer";

/**
 * /manage/cap-table
 *
 * The main place to perform cap table operations:
 * - Create stock classes
 * - Create stakeholders
 * - Issue stock
 * - View holdings, etc.
 *
 * Supports:
 * - ?issuerId=... in the URL (preferred, coming from /mint success)
 * - Auto-loading the last minted issuer from localStorage
 * - Graceful prompt if nothing is available
 */
export default function ManageCapTablePage() {
	const router = useRouter();
	const { issuerId: queryIssuerId } = router.query;

	const [issuer, setIssuer] = useState<IssuerResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady) return;

		const tryLoad = async () => {
			setIsLoading(true);

			let loadedIssuer: IssuerResponse | null = null;

			// 1. Prefer explicit ?issuerId from URL
			if (typeof queryIssuerId === "string" && queryIssuerId.length > 0) {
				// Prefer full issuer from the new /issuer/full/:id (gives legal_name, deployed_by, all OCF fields, etc.)
				try {
					const fullRes = await fetch(`/api/issuer/full/${encodeURIComponent(queryIssuerId)}`);
					if (fullRes.ok) {
						const full = await fullRes.json();
						if (full && full._id) {
							loadedIssuer = {
								_id: full._id,
								legal_name: full.legal_name || "Cap Table",
								deployed_to: full.deployed_to || "",
								tx_hash: full.tx_hash || "",
							};
						}
					}
				} catch {
					// fall through to lastMintedIssuer fallback below
				}

				if (!loadedIssuer) {
					// Fall back to lastMinted storage (has deployed_to from mint success)
					const last = getLastMintedIssuer();
					if (last && last._id === queryIssuerId) {
						loadedIssuer = {
							_id: last._id,
							legal_name: last.legal_name || "Cap Table",
							deployed_to: last.deployed_to || "",
							tx_hash: last.tx_hash || "",
						};
					} else {
						// Last resort: minimal object (direct signing still works once you know deployed_to)
						loadedIssuer = {
							_id: queryIssuerId,
							legal_name: "Cap Table",
							deployed_to: "",
							tx_hash: "",
						};
					}
				}
			}

			// 2. Fall back to last minted from localStorage (try full fetch too)
			if (!loadedIssuer) {
				const last: LastMintedIssuer | null = getLastMintedIssuer();
				if (last) {
					try {
						const fullRes = await fetch(`/api/issuer/full/${encodeURIComponent(last._id)}`);
						if (fullRes.ok) {
							const full = await fullRes.json();
							if (full?._id) {
								loadedIssuer = {
									_id: full._id,
									legal_name: full.legal_name || last.legal_name || "Cap Table",
									deployed_to: full.deployed_to || last.deployed_to || "",
									tx_hash: full.tx_hash || last.tx_hash || "",
								};
							}
						}
					} catch {
						// fall through to legacy lastMintedIssuer shape below
					}
					if (!loadedIssuer) {
						loadedIssuer = {
							_id: last._id,
							legal_name: last.legal_name || "Cap Table",
							deployed_to: last.deployed_to || "",
							tx_hash: last.tx_hash || "",
						};
					}
				}
			}

			if (loadedIssuer) {
				setIssuer(loadedIssuer);
			}

			setIsLoading(false);
		};

		tryLoad();
	}, [router.isReady, queryIssuerId]);

	if (isLoading) {
		return (
			<FullScreenStack>
				<PageIntro>
					<P>Loading cap table...</P>
				</PageIntro>
			</FullScreenStack>
		);
	}

	if (!issuer) {
		return (
			<FullScreenStack>
				<PageIntro>
					<P>
						No cap table selected.{" "}
						<a href="/mint">Mint a new one</a> or provide an <code>issuerId</code> in the URL.
					</P>
				</PageIntro>
			</FullScreenStack>
		);
	}

	return (
		<CapTableDashboard
			issuerResult={issuer}
			onReset={() => {
				// "Mint Another" from here sends user back to mint
				router.push("/mint");
			}}
		/>
	);
}
