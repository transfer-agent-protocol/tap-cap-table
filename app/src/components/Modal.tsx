import { useEffect } from "react";
import styled from "styled-components";
import { Button } from "./elements";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	maxWidth?: string;
}

const Backdrop = styled.div`
	position: fixed;
	inset: 0;
	background: ${({ theme }) => theme.colors.overlay};
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: ${({ theme }) => theme.zIndices.modal};
	padding: ${({ theme }) => theme.spacing.md};
	backdrop-filter: blur(8px);
	-webkit-backdrop-filter: blur(8px);
	animation: fadeIn 160ms ease;

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
`;

const Dialog = styled.div<{ $maxWidth: string }>`
	background: ${({ theme }) => theme.colors.background};
	border: 1px solid ${({ theme }) => theme.colors.borderStrong};
	width: 100%;
	max-width: ${({ $maxWidth }) => $maxWidth};
	box-shadow: ${({ theme }) => theme.shadows.overlay};
	overflow: hidden;
	animation: rise 200ms cubic-bezier(0.22, 1, 0.36, 1);

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
`;

const Header = styled.div`
	padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.span`
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	letter-spacing: -0.02em;
	color: ${({ theme }) => theme.colors.text};
`;

const CloseBtn = styled.button`
	background: transparent;
	border: 1px solid ${({ theme }) => theme.colors.border};
	width: 2rem;
	height: 2rem;
	font-size: 1.1rem;
	line-height: 1;
	cursor: pointer;
	color: ${({ theme }) => theme.colors.textMuted};
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: color ${({ theme }) => theme.transitions.default},
		border-color ${({ theme }) => theme.transitions.default},
		background ${({ theme }) => theme.transitions.default};

	&:hover {
		color: ${({ theme }) => theme.colors.text};
		border-color: ${({ theme }) => theme.colors.borderStrong};
		background: ${({ theme }) => theme.colors.elevated};
	}
`;

const Body = styled.div`
	padding: ${({ theme }) => theme.spacing.lg};
	color: ${({ theme }) => theme.colors.textMuted};
	font-size: ${({ theme }) => theme.fontSizes.small};
	line-height: ${({ theme }) => theme.lineHeights.P};
`;

const Footer = styled.div`
	padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
	display: flex;
	justify-content: flex-end;
`;

export function Modal({ isOpen, onClose, title, children, maxWidth = "440px" }: ModalProps) {
	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<Backdrop onClick={onClose} role="presentation">
			<Dialog
				$maxWidth={maxWidth}
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label={title || "Dialog"}
			>
				{title && (
					<Header>
						<Title>{title}</Title>
						<CloseBtn onClick={onClose} aria-label="Close modal" type="button">
							×
						</CloseBtn>
					</Header>
				)}
				<Body>{children}</Body>
				{!title && (
					<Footer>
						<Button onClick={onClose} $variant="primary" type="button">
							Close
						</Button>
					</Footer>
				)}
			</Dialog>
		</Backdrop>
	);
}
