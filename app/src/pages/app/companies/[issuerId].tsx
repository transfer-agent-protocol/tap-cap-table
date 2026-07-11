import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { P } from "../../../components/typography";
import {
	FullScreenStack,
	PageIntro,
	SectionActions,
	StatusBox,
} from "../../../components/wrappers";
import { InlineButton } from "../../../components/buttons";
import { CapTableDashboard } from "../../../components/CapTableDashboard";
import type { IssuerResponse } from "../../../services/registerIssuer";
import { getLastMintedIssuer } from "../../../utils/lastMintedIssuer";
import { loadMyIssuers } from "../../../utils/myIssuers";
import { issuerIdFromPath } from "../../../components/navConfig";

function resolveIssuerId(query: Record<string, string | string[] | undefined>, asPath: string): string | null {
	const raw = query.issuerId;
	if (typeof raw === "string" && raw.length > 0 && raw !== "undefined") return raw;
	if (Array.isArray(raw) && raw[0]) return raw[0];
	// Belt-and-suspenders: turbopack / hydration edge cases
	const path = asPath.split("?")[0] || "";
	return issuerIdFromPath(path);
}

async function fetchFullIssuer(id: string): Promise<IssuerResponse | null> {
	const res = await fetch(`/api/issuer/full/${encodeURIComponent(id)}`, { cache: "no-store" });
	if (!res.ok) {
		console.warn(`[app/companies] full issuer ${id} → HTTP ${res.status}`);
		return null;
	}
	const full = await res.json();
	if (!full?._id) return null;
	return {
		_id: full._id,
		legal_name: full.legal_name || "Cap Table",
		deployed_to: full.deployed_to || "",
		tx_hash: full.tx_hash || "",
	};
}

function fromLocal(id: string): IssuerResponse | null {
	const mine = loadMyIssuers().find((i) => i._id === id);
	if (mine) {
		return {
			_id: mine._id,
			legal_name: mine.legal_name || "Cap Table",
			deployed_to: mine.deployed_to || "",
			tx_hash: mine.tx_hash || "",
		};
	}
	const last = getLastMintedIssuer();
	if (last?._id === id) {
		return {
			_id: last._id,
			legal_name: last.legal_name || "Cap Table",
			deployed_to: last.deployed_to || "",
			tx_hash: last.tx_hash || "",
		};
	}
	return null;
}

/**
 * /app/companies/[issuerId] — company cap table workspace.
 */
export default function CompanyWorkspacePage() {
	const router = useRouter();
	const issuerId = router.isReady
		? resolveIssuerId(router.query as Record<string, string | string[] | undefined>, router.asPath)
		: null;

	const [issuer, setIssuer] = useState<IssuerResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const load = useCallback(async (id: string) => {
		setIsLoading(true);
		setLoadError(null);

		const local = fromLocal(id);
		let remote: IssuerResponse | null = null;

		// Retry once — transient proxy/API blips after route change
		for (let attempt = 0; attempt < 2 && !remote; attempt++) {
			try {
				remote = await fetchFullIssuer(id);
			} catch (err) {
				console.warn("[app/companies] full fetch failed", err);
			}
			if (!remote && attempt === 0) {
				await new Promise((r) => setTimeout(r, 200));
			}
		}

		const merged: IssuerResponse | null = remote
			? {
					_id: remote._id,
					legal_name: remote.legal_name || local?.legal_name || "Cap Table",
					deployed_to: remote.deployed_to || local?.deployed_to || "",
					tx_hash: remote.tx_hash || local?.tx_hash || "",
				}
			: local;

		if (!merged) {
			setIssuer(null);
			setLoadError("Company not found. It may not exist on this server.");
			setIsLoading(false);
			return;
		}

		// If still no contract, try holdings (returns issuer with deployed_to when present)
		if (!merged.deployed_to) {
			try {
				const hRes = await fetch(
					`/api/cap-table/holdings/stock?issuerId=${encodeURIComponent(id)}`,
					{ cache: "no-store" },
				);
				if (hRes.ok) {
					const h = await hRes.json();
					if (h?.issuer?.deployed_to) {
						merged.deployed_to = h.issuer.deployed_to;
						if (h.issuer.legal_name) merged.legal_name = h.issuer.legal_name;
						if (h.issuer.tx_hash) merged.tx_hash = h.issuer.tx_hash;
					}
				}
			} catch {
				// non-blocking
			}
		}

		setIssuer(merged);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		if (!router.isReady || !issuerId) {
			if (router.isReady && !issuerId) {
				setIsLoading(false);
				setLoadError("Missing company id in the URL.");
			}
			return;
		}
		void load(issuerId);
	}, [router.isReady, issuerId, load]);

	if (isLoading) {
		return (
			<FullScreenStack>
				<PageIntro>
					<P>Loading cap table…</P>
				</PageIntro>
			</FullScreenStack>
		);
	}

	if (!issuer || loadError) {
		return (
			<FullScreenStack>
				<PageIntro>
					<StatusBox $variant="error">{loadError || "No company selected."}</StatusBox>
					<P style={{ marginTop: "1rem" }}>
						<a href="/app/companies">← Companies</a>
						{" · "}
						<a href="/app/mint">Create a company</a>
					</P>
					{issuerId && (
						<SectionActions style={{ marginTop: "1rem" }}>
							<InlineButton onClick={() => void load(issuerId)} $variant="secondary">
								Retry
							</InlineButton>
						</SectionActions>
					)}
				</PageIntro>
			</FullScreenStack>
		);
	}

	return (
		<CapTableDashboard
			issuerResult={issuer}
			onReset={() => {
				router.push("/app/mint");
			}}
		/>
	);
}
