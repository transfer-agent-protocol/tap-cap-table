import { useEffect } from "react";
import { useRouter } from "next/router";

/** Legacy /manage → /app/companies */
export default function ManageRedirect() {
	const router = useRouter();
	useEffect(() => {
		void router.replace("/app/companies");
	}, [router]);
	return null;
}
