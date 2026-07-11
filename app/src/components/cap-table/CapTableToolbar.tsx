import { SectionActions } from "../wrappers";
import { InlineButton } from "../buttons";
import { copy } from "../../lib/copy";

interface CapTableToolbarProps {
	onRefresh: () => void;
	busy?: boolean;
}

/** Shared quiet refresh control for company workspace views. */
export function CapTableToolbar({ onRefresh, busy }: CapTableToolbarProps) {
	return (
		<SectionActions>
			<InlineButton
				onClick={onRefresh}
				disabled={busy}
				$variant="ghost"
				title="Refresh holdings and transactions from the blockchain"
			>
				{busy ? copy.sync.working : copy.sync.idle}
			</InlineButton>
		</SectionActions>
	);
}
