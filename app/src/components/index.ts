/**
 * TAP app component library — single public export surface.
 *
 * Design system (pure styled-components, lowercase files):
 *   theme.ts · global-style.ts · typography.tsx · elements.tsx · forms.tsx · layout.tsx
 * Shell (app chrome): shell/
 * Feature module: cap-table/
 */

// Design tokens
export { default as theme } from "./theme";

// Typography
export { H1, H2, H3, P, Label, Eyebrow, MutedText, Mono } from "./typography";

// Elements
export {
	Button,
	Panel,
	StatusMessage,
	Table,
	TableFrame,
	StatGrid,
	StatCard,
	StatLabel,
	StatValue,
	Divider,
	ResponseBlock,
} from "./elements";
export type { ButtonVariant, ButtonSize } from "./elements";

// Forms
export {
	Form,
	Fieldset,
	Field,
	FieldRow,
	FieldLabel,
	TextInput,
	Select,
	TextArea,
	ValidationMessage,
} from "./forms";

// Layout
export {
	Page,
	ContentColumn,
	Stack,
	Section,
	SectionHeader,
	SectionActions,
	Grid,
	PageHeaderBar,
} from "./layout";
export { PageHeader } from "./PageHeader";

// Modal / table
export { Modal } from "./Modal";
export { TxSuccessModal } from "./TxSuccessModal";
export { DataTable } from "./DataTable";

// Shell
export { default as AppShell } from "./shell/AppShell";
export { default as TopBar } from "./shell/TopBar";
export { SideNav } from "./shell/SideNav";
export { AppShellProvider, useAppShell } from "./shell/AppShellContext";
export {
	APP_NAV_ITEMS,
	CAP_TABLE_SECTIONS,
	capTableHref,
	isCompanyWorkspacePath,
	isWorkspaceRoute,
	issuerIdFromPath,
	parseCapTableView,
} from "./shell/navConfig";
export type { CapTableView } from "./shell/navConfig";

// Cap-table feature
export { CapTableDashboard } from "./cap-table";
export type { CapTableDashboardProps } from "./cap-table";
export { IssuerForm } from "./cap-table/forms/IssuerForm";
export { StakeholderForm } from "./cap-table/forms/StakeholderForm";
export { StockClassForm } from "./cap-table/forms/StockClassForm";
export { IssueStockForm } from "./cap-table/forms/IssueStockForm";
export { MintActions } from "./cap-table/forms/MintActions";
export { IssuerHeader } from "./cap-table/forms/IssuerHeader";
export { HoldingsTable } from "./cap-table/forms/HoldingsTable";
