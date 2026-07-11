import { useEffect } from "react";
import { useRouter } from "next/router";

/** /app → companies hub */
export default function AppIndex() {
	const router = useRouter();
	useEffect(() => {
		void router.replace("/app/companies");
	}, [router]);
	return null;
}
