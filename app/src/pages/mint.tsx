import { useEffect } from "react";
import { useRouter } from "next/router";

/** Legacy /mint → /app/mint */
export default function MintRedirect() {
	const router = useRouter();
	useEffect(() => {
		void router.replace("/app/mint");
	}, [router]);
	return null;
}
