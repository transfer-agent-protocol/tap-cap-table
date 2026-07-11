import type { StockClassData } from "../../services/createStockClass";
import type { StakeholderData } from "../../services/createStakeholder";
import type { StockIssuanceData } from "../../services/createStockIssuance";
import type { IssuerResponse } from "../../services/registerIssuer";
import type { ActivityEntry } from "../../utils/activityLog";
import type { CapTableView } from "../navConfig";

export interface OptimisticStockClass {
	_id: string;
	name: string;
	class_type: string;
	initial_shares_authorized?: string;
	/** True after wallet receipt — safe to issue against */
	onchain?: boolean;
}

export interface OptimisticStakeholder {
	_id: string;
	name: any;
	stakeholder_type: string;
	current_relationship?: string;
}

export interface OptimisticIssuance {
	_id: string;
	security_id: string;
	quantity: string;
	stakeholder_id: string;
	stock_class_id: string;
	share_price?: { amount: string; currency: string };
	stakeholder_name?: string;
	stock_class_name?: string;
	custom_id?: string;
	txHash?: string;
	/** Wallet receipt status === success */
	confirmed?: boolean;
	date?: string;
}

export interface SuccessModalState {
	title: string;
	txHash?: string;
	message?: string;
	variant?: "success" | "error" | "info";
}

export interface CapTableDashboardProps {
	issuerResult: IssuerResponse;
	onReset: () => void;
}

export type { StockClassData, StakeholderData, StockIssuanceData, ActivityEntry, CapTableView };

export function dedupeById<T extends { _id?: string }>(items: T[]): T[] {
	const byId = new Map(items.filter(Boolean).map((x) => [x._id, x]));
	return Array.from(byId.values()) as T[];
}

export function formatRelationship(raw: unknown): string {
	if (raw == null || raw === "") return "—";
	return String(raw)
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/^\w/, (c) => c.toUpperCase());
}

export function formatClassType(raw: unknown): string {
	if (raw === "PREFERRED") return "Preferred";
	if (raw === "COMMON") return "Common";
	return raw != null && raw !== "" ? String(raw) : "—";
}

export function formatStakeholderType(raw: unknown): string {
	if (raw === "INSTITUTION") return "Institution";
	if (raw === "INDIVIDUAL") return "Individual";
	return raw != null && raw !== "" ? String(raw) : "—";
}
