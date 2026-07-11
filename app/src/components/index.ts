/**
 * TAP app component library — single public export surface.
 *
 * Prefer: `import { InlineButton, Panel, theme } from "../components"`
 * Feature modules (cap-table) can also be imported from here.
 */

// Design tokens
export { default as theme } from "./theme";

// Primitives — buttons
export {
	InlineButton,
	MintButton,
	PrimaryButton,
	WalletButtonStyled,
	LogoRouter,
	StyledA,
} from "./buttons";

// Primitives — forms
export {
	FieldGroup,
	FieldRow,
	FieldLabel,
	SectionLabel,
	Input,
	Select,
	Divider,
	FormWrapper,
	FormInput,
	FormTextArea,
	FormValidation,
} from "./forms";

// Primitives — typography
export { H1, H2, H3, Blockquote, P, Label, OrderedList, Eyebrow } from "./typography";

// Layout primitives + page chrome (from wrappers)
export {
	FullWidth,
	Nav,
	NavBrand,
	NavTitle,
	Main,
	Heading,
	Content,
	StyledTable,
	FooterWrapper,
	FooterContent,
	Panel,
	StatusBox,
	ResponseBlock,
	FullScreenMain,
	FullScreenStack,
	PageIntro,
	ActionTableLayout,
	PageLayout,
	FormBand,
	DataBand,
	DashboardHeader,
	TablePanel,
	TableTitle,
	SectionHeader,
	SectionActions,
	TableScroll,
	MutedText,
} from "./wrappers";

// Modal / table
export { Modal } from "./Modal";
export { TxSuccessModal } from "./TxSuccessModal";
export { DataTable } from "./DataTable";

// Shell
export { default as Layout } from "./layout";
export { LeftNavDrawer } from "./LeftNavDrawer";
export { default as Navbar } from "./Navbar";
export {
	APP_NAV_ITEMS,
	CAP_TABLE_SECTIONS,
	capTableHref,
	isCompanyWorkspacePath,
	isWorkspaceRoute,
	issuerIdFromPath,
	parseCapTableView,
} from "./navConfig";
export type { CapTableView } from "./navConfig";

// Domain forms
export { IssuerForm } from "./IssuerForm";
export { StakeholderForm } from "./StakeholderForm";
export { StockClassForm } from "./StockClassForm";
export { IssueStockForm } from "./IssueStockForm";
export { MintActions } from "./MintActions";
export { IssuerHeader } from "./IssuerHeader";
export { HoldingsTable } from "./HoldingsTable";

// Cap-table feature
export { CapTableDashboard } from "./cap-table";
export type { CapTableDashboardProps } from "./cap-table";
