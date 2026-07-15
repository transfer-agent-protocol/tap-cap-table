import dynamic from "next/dynamic";
import { Button } from "../elements";
import { isReownConfigured } from "../../config/wagmi";

/**
 * Outer shell never calls AppKit hooks — createAppKit is skipped when
 * NEXT_PUBLIC_REOWN_PROJECT_ID is missing/placeholder, and useAppKit* would throw.
 */
export default function WalletButtonClient() {
	if (!isReownConfigured) {
		return (
			<Button
				$variant="secondary"
				type="button"
				title="Set NEXT_PUBLIC_REOWN_PROJECT_ID in app/.env.local (https://cloud.reown.com), then restart the app"
				onClick={() => {
					// eslint-disable-next-line no-alert
					alert(
						"Wallet connect needs a Reown project id.\n\n1. Create one at https://cloud.reown.com\n2. Set NEXT_PUBLIC_REOWN_PROJECT_ID in app/.env.local (and root .env for Docker app)\n3. Restart pnpm app:dev (or rebuild Docker app)",
					);
				}}
			>
				Set Reown project id
			</Button>
		);
	}

	return <ConfiguredWalletButton />;
}

const ConfiguredWalletButton = dynamic(() => import("./ConfiguredWalletButton"), {
	ssr: false,
	loading: () => (
		<Button $variant="primary" type="button" disabled>
			Connect Wallet
		</Button>
	),
});
