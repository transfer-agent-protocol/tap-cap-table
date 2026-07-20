const STORAGE_KEY = "tap.wallet.recentConnectorId";

export function getRecentConnectorId(): string | null {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

export function setRecentConnectorId(connectorId: string): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, connectorId);
	} catch {
		// ignore quota / private mode
	}
}

export function clearRecentConnectorId(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}
