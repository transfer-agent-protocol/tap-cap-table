import styled from "styled-components";
import { useEffect } from "react";

const Overlay = styled.div<{ $isOpen: boolean }>`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
	pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
	transition: opacity 0.2s ease;
	z-index: 90;
`;

const Drawer = styled.div<{ $isOpen: boolean }>`
	position: fixed;
	top: 0;
	right: 0;
	height: 100vh;
	width: min(320px, 85vw);
	background: ${({ theme }) => theme.colors.background};
	border-left: 1px solid ${({ theme }) => theme.colors.outline};
	box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
	transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
	transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
	z-index: 100;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

const DrawerHeader = styled.div`
	padding: 1rem 1.25rem;
	border-bottom: 1px solid ${({ theme }) => theme.colors.outline};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	font-size: ${({ theme }) => theme.fontSizes.medium};
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	font-size: 1.25rem;
	cursor: pointer;
	line-height: 1;
	color: ${({ theme }) => theme.colors.text};
`;

const NavSection = styled.div`
	padding: 0.75rem 0;
`;

const NavLabel = styled.div`
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	text-transform: uppercase;
	letter-spacing: 0.05em;
	padding: 0.5rem 1.25rem;
	color: ${({ theme }) => theme.colors.text};
	opacity: 0.6;
`;

const NavItem = styled.button<{ $active?: boolean }>`
	display: block;
	width: 100%;
	text-align: left;
	padding: 0.55rem 1.25rem;
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	background: ${({ $active, theme }) => ($active ? theme.colors.input : "transparent")};
	border: none;
	color: ${({ theme }) => theme.colors.text};
	cursor: pointer;
	transition: background 0.1s ease;

	&:hover {
		background: ${({ theme }) => theme.colors.input};
	}
`;

const NavSubItem = styled(NavItem)`
	padding-left: 2rem;
	font-size: ${({ theme }) => theme.fontSizes.small};
	opacity: 0.85;
`;

const DrawerFooter = styled.div`
	margin-top: auto;
	padding: 1rem 1.25rem;
	border-top: 1px solid ${({ theme }) => theme.colors.outline};
	font-size: ${({ theme }) => theme.fontSizes.small};
	opacity: 0.6;
`;

export type MintView = "overview" | "stock-classes" | "stakeholders" | "activity";

interface MintNavDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	currentView: MintView;
	onNavigate: (view: MintView, id?: string) => void;

	// Data from the session (things the user created)
	stockClasses: Array<{ _id: string; name: string }>;
	stakeholders: Array<{ _id: string; name: { legal_name?: string } }>;
}

export function MintNavDrawer({
	isOpen,
	onClose,
	currentView,
	onNavigate,
	stockClasses,
	stakeholders,
}: MintNavDrawerProps) {
	// Close on Escape key
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	const handleNav = (view: MintView, id?: string) => {
		onNavigate(view, id);
		onClose(); // close after navigation (nice mobile + desktop behavior)
	};

	return (
		<>
			<Overlay $isOpen={isOpen} onClick={onClose} />

			<Drawer $isOpen={isOpen}>
				<DrawerHeader>
					<span>Cap Table Menu</span>
					<CloseButton onClick={onClose} aria-label="Close menu">
						×
					</CloseButton>
				</DrawerHeader>

				<NavSection>
					<NavLabel>Views</NavLabel>
					<NavItem
						$active={currentView === "overview"}
						onClick={() => handleNav("overview")}
					>
						Overview &amp; Holdings
					</NavItem>
					<NavItem
						$active={currentView === "stock-classes"}
						onClick={() => handleNav("stock-classes")}
					>
						Stock Classes ({stockClasses.length})
					</NavItem>
					<NavItem
						$active={currentView === "stakeholders"}
						onClick={() => handleNav("stakeholders")}
					>
						Stakeholders
					</NavItem>
					<NavItem
						$active={currentView === "activity"}
						onClick={() => handleNav("activity")}
					>
						Activity &amp; Issuances
					</NavItem>
				</NavSection>

				{stockClasses.length > 0 && (
					<NavSection>
						<NavLabel>Stock Classes</NavLabel>
						{stockClasses.map((sc) => (
							<NavSubItem
								key={sc._id}
								onClick={() => handleNav("stock-classes", sc._id)}
							>
								{sc.name}
							</NavSubItem>
						))}
					</NavSection>
				)}

				{stakeholders.length > 0 && (
					<NavSection>
						<NavLabel>Stakeholders</NavLabel>
						{stakeholders.map((sh) => (
							<NavSubItem
								key={sh._id}
								onClick={() => handleNav("stakeholders", sh._id)}
							>
								{sh.name?.legal_name || sh._id}
							</NavSubItem>
						))}
					</NavSection>
				)}

				<DrawerFooter>
					These are the entities created in this mint session.
					<br />
					More features coming soon.
				</DrawerFooter>
			</Drawer>
		</>
	);
}
