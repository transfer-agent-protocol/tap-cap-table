import { createContext, useContext, useState, type ReactNode } from "react";

interface CapTableMenuValue {
	isOpen: boolean;
	setOpen: (open: boolean) => void;
	isEnabled: boolean;
	setEnabled: (enabled: boolean) => void;
}

const CapTableMenuContext = createContext<CapTableMenuValue | null>(null);

export function CapTableMenuProvider({ children }: { children: ReactNode }) {
	const [isOpen, setOpen] = useState(false);
	const [isEnabled, setEnabled] = useState(false);
	return (
		<CapTableMenuContext.Provider value={{ isOpen, setOpen, isEnabled, setEnabled }}>
			{children}
		</CapTableMenuContext.Provider>
	);
}

/**
 * Hook for components that want to read/control the cap-table menu drawer.
 *
 * The provider is wired into `_app.tsx`, but this hook returns a safe no-op
 * default if it is rendered outside of a provider so that downstream
 * components don't need to special-case missing context (e.g. during tests).
 */
export function useCapTableMenu(): CapTableMenuValue {
	const ctx = useContext(CapTableMenuContext);
	if (!ctx) {
		return {
			isOpen: false,
			setOpen: () => {},
			isEnabled: false,
			setEnabled: () => {},
		};
	}
	return ctx;
}
