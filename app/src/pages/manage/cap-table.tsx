import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Legacy /manage/cap-table?issuerId=… → /app/companies/[issuerId]?view=…
 */
export default function ManageCapTableRedirect() {
	const router = useRouter();

	useEffect(() => {
		if (!router.isReady) return;
		const issuerId =
			typeof router.query.issuerId === "string" ? router.query.issuerId : null;
		const view = typeof router.query.view === "string" ? router.query.view : null;
		if (issuerId) {
			const q = view && view !== "overview" ? `?view=${encodeURIComponent(view)}` : "";
			void router.replace(`/app/companies/${encodeURIComponent(issuerId)}${q}`);
		} else {
			void router.replace("/app/companies");
		}
	}, [router, router.isReady, router.query.issuerId, router.query.view]);

	return null;
}
