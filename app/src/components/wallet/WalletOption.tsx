import styled, { keyframes } from "styled-components";

export interface WalletOptionProps {
	id: string;
	name: string;
	icon?: string | null;
	isRecent?: boolean;
	isDetected?: boolean;
	isPending?: boolean;
	disabled?: boolean;
	onClick: () => void;
}

const Row = styled.button<{ $disabled?: boolean }>`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing.md};
	width: 100%;
	padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
	background: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
	color: ${({ theme }) => theme.colors.text};
	cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
	opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
	text-align: left;
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.baseline};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	transition: background ${({ theme }) => theme.transitions.default},
		border-color ${({ theme }) => theme.transitions.default};

	&:hover:not(:disabled) {
		background: ${({ theme }) => theme.colors.elevated};
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus-visible {
		outline: 1px solid ${({ theme }) => theme.colors.accent};
		outline-offset: 1px;
	}
`;

const Left = styled.span`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.md};
	min-width: 0;
`;

const IconWrap = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	flex-shrink: 0;
	background: ${({ theme }) => theme.colors.elevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	overflow: hidden;
`;

const IconImg = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const Glyph = styled.span`
	font-size: ${({ theme }) => theme.fontSizes.small};
	color: ${({ theme }) => theme.colors.textMuted};
	font-family: ${({ theme }) => theme.fonts.mono};
`;

const Name = styled.span`
	font-family: ${({ theme }) => theme.fonts.sans};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const Badge = styled.span`
	flex-shrink: 0;
	font-family: ${({ theme }) => theme.fonts.sans};
	font-size: ${({ theme }) => theme.fontSizes.xs};
	font-weight: ${({ theme }) => theme.fontWeights.medium};
	color: ${({ theme }) => theme.colors.accent};
	letter-spacing: 0.02em;
	text-transform: uppercase;
`;

const spin = keyframes`
	to {
		transform: rotate(360deg);
	}
`;

const Spinner = styled.span`
	display: inline-block;
	width: 0.875rem;
	height: 0.875rem;
	border: 1.5px solid ${({ theme }) => theme.colors.borderStrong};
	border-top-color: ${({ theme }) => theme.colors.accent};
	border-radius: 50%;
	animation: ${spin} 0.7s linear infinite;
`;

export function WalletOption({
	id,
	name,
	icon,
	isRecent,
	isDetected,
	isPending,
	disabled,
	onClick,
}: WalletOptionProps) {
	return (
		<Row
			type="button"
			onClick={onClick}
			disabled={disabled}
			$disabled={disabled}
			data-testid="wallet-option"
			data-wallet-id={id}
			aria-busy={isPending || undefined}
		>
			<Left>
				<IconWrap aria-hidden>
					{icon ? <IconImg src={icon} alt="" /> : <Glyph>{name.slice(0, 1).toUpperCase()}</Glyph>}
				</IconWrap>
				<Name>{name}</Name>
			</Left>
			{isPending ? (
				<Spinner aria-label="Connecting" />
			) : isRecent ? (
				<Badge>Recent</Badge>
			) : isDetected ? (
				<Badge>Detected</Badge>
			) : null}
		</Row>
	);
}
