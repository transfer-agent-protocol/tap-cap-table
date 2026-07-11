import styled, { css } from "styled-components";

const LogoRouter = styled.button`
	position: relative;
	display: inline-flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	min-width: 40px;
	min-height: 40px;
	padding: 0;
	background: transparent;
	border: none;
	cursor: pointer;
	border-radius: ${({ theme }) => theme.radii.sm};
	transition: opacity ${({ theme }) => theme.transitions.default},
		transform ${({ theme }) => theme.transitions.spring};

	&:hover {
		opacity: 0.9;
		transform: scale(1.03);
	}
`;

const StyledA = styled.button`
	position: relative;
	display: inline-flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	height: 2rem;
	padding: 0 ${({ theme }) => theme.spacing.sm};
	background: transparent;
	border: none;
	color: ${({ theme }) => theme.colors.muted};
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-family: inherit;
	cursor: pointer;
	transition: color ${({ theme }) => theme.transitions.default};

	&:hover {
		color: ${({ theme }) => theme.colors.main};
	}
`;

const buttonBase = css`
	display: inline-flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing.sm};
	font-family: inherit;
	font-weight: ${({ theme }) => theme.fontWeights.semibold};
	letter-spacing: -0.01em;
	border: 1px solid transparent;
	cursor: pointer;
	text-decoration: none !important;
	transition: background ${({ theme }) => theme.transitions.default},
		border-color ${({ theme }) => theme.transitions.default},
		color ${({ theme }) => theme.transitions.default},
		box-shadow ${({ theme }) => theme.transitions.default},
		transform ${({ theme }) => theme.transitions.default},
		opacity ${({ theme }) => theme.transitions.default};

	&:disabled {
		cursor: not-allowed;
		box-shadow: none !important;
		transform: none !important;
		filter: none;
	}
`;

const PrimaryButton = styled.button`
	${buttonBase}
	width: auto;
	min-width: 9rem;
	height: 2.75rem;
	margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.md} 0;
	padding: 0 ${({ theme }) => theme.spacing.lg};
	background: ${({ theme }) => theme.colors.main};
	color: ${({ theme }) => theme.colors.inverse};
	border-radius: ${({ theme }) => theme.radii.sm};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	box-shadow: ${({ theme }) => theme.shadows.glow};

	&:hover:not(:disabled),
	&:focus:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 0 32px rgba(200, 245, 66, 0.28);
		/* Keep dark ink on signal green — never white */
		color: ${({ theme }) => theme.colors.inverse};
		background: ${({ theme }) => theme.colors.main};
		opacity: 1;
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.elevated};
		color: ${({ theme }) => theme.colors.subtle};
		border: 1px solid ${({ theme }) => theme.colors.outline};
	}
`;

const WalletButtonStyled = styled.button`
	${buttonBase}
	height: 2.375rem;
	padding: 0 ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.main};
	color: ${({ theme }) => theme.colors.inverse};
	border-radius: ${({ theme }) => theme.radii.pill};
	font-size: ${({ theme }) => theme.fontSizes.small};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	letter-spacing: 0.02em;
	white-space: nowrap;
	box-shadow: ${({ theme }) => theme.shadows.glow};

	&:hover:not(:disabled),
	&:focus:not(:disabled) {
		box-shadow: 0 0 28px rgba(200, 245, 66, 0.32);
		transform: translateY(-1px);
		color: ${({ theme }) => theme.colors.inverse};
		background: ${({ theme }) => theme.colors.main};
		opacity: 1;
	}
`;

const MintButton = styled.button`
	${buttonBase}
	width: 100%;
	height: 3rem;
	margin-top: ${({ theme }) => theme.spacing.md};
	background: ${({ theme }) => theme.colors.main};
	color: ${({ theme }) => theme.colors.inverse};
	border-radius: ${({ theme }) => theme.radii.sm};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	box-shadow: ${({ theme }) => theme.shadows.glow};

	&:hover:not(:disabled),
	&:focus:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 0 32px rgba(200, 245, 66, 0.28);
		color: ${({ theme }) => theme.colors.inverse};
		background: ${({ theme }) => theme.colors.main};
		opacity: 1;
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.elevated};
		color: ${({ theme }) => theme.colors.subtle};
		border: 1px solid ${({ theme }) => theme.colors.outline};
	}
`;

const InlineButton = styled.button<{ $variant?: "primary" | "secondary" | "danger" | "ghost" }>`
	${buttonBase}
	min-height: 2.125rem;
	padding: 0 ${({ theme }) => theme.spacing.md};
	border-radius: ${({ theme }) => theme.radii.sm};
	font-size: ${({ theme }) => theme.fontSizes.small};
	white-space: nowrap;

	${({ theme, $variant = "secondary" }) => {
		if ($variant === "primary") {
			return css`
				background: ${theme.colors.main};
				color: ${theme.colors.inverse};
				border-color: ${theme.colors.main};
				box-shadow: ${theme.shadows.glow};

				&:hover:not(:disabled),
				&:focus:not(:disabled) {
					transform: translateY(-1px);
					color: ${theme.colors.inverse};
					background: ${theme.colors.main};
					opacity: 1;
					text-decoration: none;
				}

				&:disabled {
					background: ${theme.colors.elevated};
					color: ${theme.colors.subtle};
					border-color: ${theme.colors.outline};
					box-shadow: none;
				}
			`;
		}
		if ($variant === "danger") {
			return css`
				background: transparent;
				color: ${theme.colors.error};
				border-color: rgba(251, 113, 133, 0.35);

				&:hover:not(:disabled),
				&:focus:not(:disabled) {
					background: ${theme.colors.errorBg};
					border-color: ${theme.colors.error};
					color: ${theme.colors.error};
					opacity: 1;
					text-decoration: none;
				}
			`;
		}
		if ($variant === "ghost") {
			return css`
				background: transparent;
				color: ${theme.colors.muted};
				border-color: transparent;

				&:hover:not(:disabled),
				&:focus:not(:disabled) {
					color: ${theme.colors.main};
					background: ${theme.colors.input};
					opacity: 1;
					text-decoration: none;
				}
			`;
		}
		// secondary — green accent on hover, never white
		return css`
			background: transparent;
			color: ${theme.colors.text};
			border-color: ${theme.colors.borderStrong};

			&:hover:not(:disabled),
			&:focus:not(:disabled) {
				border-color: ${theme.colors.main};
				color: ${theme.colors.main};
				background: ${theme.colors.accentMuted};
				opacity: 1;
				text-decoration: none;
			}
		`;
	}}
`;

export { LogoRouter, StyledA, PrimaryButton, WalletButtonStyled, MintButton, InlineButton };
