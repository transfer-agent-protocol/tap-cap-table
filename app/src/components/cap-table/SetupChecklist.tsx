import type { CSSProperties } from "react";
import { StatusMessage } from "../elements";
import { copy } from "../../lib/copy";
import type { CapTableView } from "../shell/navConfig";

interface SetupChecklistProps {
	peopleCount: number;
	onchainClassCount: number;
	onNavigate: (view: CapTableView) => void;
}

const linkStyle: CSSProperties = {
	background: "none",
	border: "none",
	padding: 0,
	color: "inherit",
	font: "inherit",
	cursor: "pointer",
	textDecoration: "underline",
};

/**
 * Empty-company onboarding — order matches real workflow:
 * 1) stock class  2) shareholder  3) issue stock
 */
export function SetupChecklist({ peopleCount, onchainClassCount, onNavigate }: SetupChecklistProps) {
	return (
		<StatusMessage $variant="pending">
			<strong>{copy.setup.title}</strong>
			<ol style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem" }}>
				<li style={{ opacity: onchainClassCount > 0 ? 0.55 : 1 }}>
					{onchainClassCount > 0 ? "✓ " : ""}
					<button type="button" onClick={() => onNavigate("stock-classes")} style={linkStyle}>
						{copy.setup.stepClass}
					</button>
				</li>
				<li style={{ opacity: peopleCount > 0 ? 0.55 : 1 }}>
					{peopleCount > 0 ? "✓ " : ""}
					<button type="button" onClick={() => onNavigate("stakeholders")} style={linkStyle}>
						{copy.setup.stepShareholder}
					</button>
				</li>
				<li>
					<button type="button" onClick={() => onNavigate("issue-stock")} style={linkStyle}>
						{copy.setup.stepIssue}
					</button>
				</li>
			</ol>
		</StatusMessage>
	);
}
