import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const COLLAPSED_KEY = "tap_nav_collapsed";

interface AppShellValue {
	/** Desktop: whether the left drawer is collapsed to icons/narrow rail. */
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
	toggleCollapsed: () => void;
	/** Mobile: whether the left drawer overlay is open. */
	mobileOpen: boolean;
	setMobileOpen: (open: boolean) => void;
	toggleMobileOpen: () => void;
}

const AppShellContext = createContext<AppShellValue | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
	const [collapsed, setCollapsedState] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const stored = localStorage.getItem(COLLAPSED_KEY);
			if (stored === "1") setCollapsedState(true);
		} catch {
			// ignore
		}
	}, []);

	const setCollapsed = useCallback((value: boolean) => {
		setCollapsedState(value);
		try {
			localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
		} catch {
			// ignore
		}
	}, []);

	const toggleCollapsed = useCallback(() => {
		setCollapsedState((prev) => {
			const next = !prev;
			try {
				localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
			} catch {
				// ignore
			}
			return next;
		});
	}, []);

	const toggleMobileOpen = useCallback(() => {
		setMobileOpen((prev) => !prev);
	}, []);

	return (
		<AppShellContext.Provider
			value={{
				collapsed,
				setCollapsed,
				toggleCollapsed,
				mobileOpen,
				setMobileOpen,
				toggleMobileOpen,
			}}
		>
			{children}
		</AppShellContext.Provider>
	);
}

export function useAppShell(): AppShellValue {
	const ctx = useContext(AppShellContext);
	if (!ctx) {
		return {
			collapsed: false,
			setCollapsed: () => {},
			toggleCollapsed: () => {},
			mobileOpen: false,
			setMobileOpen: () => {},
			toggleMobileOpen: () => {},
		};
	}
	return ctx;
}
