# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Transfer Agent Protocol (TAP) frontend — the `tap-app` workspace. It is both the public landing page and a wallet-based dApp for minting and managing onchain cap tables. Key screens:

- `/` — landing page
- `/mint` — deploy a new cap table from the connected admin wallet
- `/manage` — hub listing cap tables the connected wallet has deployed
- `/manage/cap-table?issuerId=...` — full dashboard to create stock classes, stakeholders, and issuances for one cap table

It talks to the TAP API server (proxied at `/api/*`) and directly to the `CapTable` / `CapTableFactory` contracts via the user's wallet. See the root [`WARP.md`](../WARP.md) for the full hybrid onchain/offchain architecture.

## Commands

Run from `app/` (root workspace aliases on the right):

```bash
pnpm dev              # Dev server                 (root: pnpm app:dev)
pnpm build            # Production build + sitemap  (root: pnpm app:build)
pnpm start            # Serve production build      (root: pnpm app:start)
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint src/
pnpm eslint <paths>   # eslint --fix
pnpm generate:wagmi   # Regenerate src/generated.ts from chain ABIs
```

`pnpm build` runs `next build` then `next-sitemap` (postbuild). The root `pnpm typecheck` includes this app via `typecheck:app`.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (Pages Router), React 19
- **Styling**: styled-components v6 with `ThemeProvider`
- **Wallet / web3**: wagmi v3 + viem v2, with Reown AppKit (`@reown/appkit`, `@reown/appkit-adapter-wagmi`) for the connect modal
- **Data fetching**: TanStack Query (`@tanstack/react-query`)
- **Font**: IBM Plex Mono (loaded via `next/font`)
- **Sitemap**: `next-sitemap` (postbuild)

### Project Structure
- `src/pages/` — Next.js pages. `_app.tsx` wires up providers; `_document.tsx`; `index.tsx` (landing); `mint.tsx`; `manage/index.tsx` and `manage/cap-table.tsx`.
- `src/components/` — styled components (lowercase files) and React components (PascalCase), e.g. `CapTableDashboard.tsx`, `IssueStockForm.tsx`, `Navbar.tsx`.
- `src/config/` — runtime + web3 config: `wagmi.ts` (AppKit + `WagmiAdapter`, networks), `Web3Provider.tsx`, `contracts.ts` (addresses, `DECIMAL_SCALE`, re-exported generated hooks).
- `src/hooks/` — wagmi hooks for onchain writes: `useMintIssuer`, `useDirectCreateStockClass`, `useDirectCreateStakeholder`, `useDirectIssueStock`, plus `useCapTableManager` (server flow + holdings).
- `src/services/` — typed `fetch` wrappers around the API server (`registerIssuer`, `createStockClass`, `createStakeholder`, `createStockIssuance`, `fetchHistoricalTransactions`).
- `src/utils/` — `uuid.ts` (UUID↔bytes16 helpers), `lastMintedIssuer.ts` (localStorage).
- `src/samples/` — sample/seed payloads for the mint flow.
- `src/generated.ts` — **generated** wagmi contract hooks (do not edit; see Contract bindings).
- `styled.d.ts` — styled-components theme type augmentation.

### Wallet & Web3 Integration
- Provider nesting in `src/pages/_app.tsx`: `Web3Provider` → `ThemeProvider` (+ `GlobalStyle`) → `CapTableMenuProvider` → `Layout`.
- `src/config/Web3Provider.tsx` wraps `WagmiProvider` (config from `wagmiAdapter.wagmiConfig`) and `QueryClientProvider`.
- `src/config/wagmi.ts` builds the Reown `WagmiAdapter` and calls `createAppKit` (guarded to the client only). Supported networks: **Plume Mainnet (98866)**, **Plume Testnet (98867)**, **Anvil (31337)**. Requires `NEXT_PUBLIC_REOWN_PROJECT_ID`.

### Contract Bindings (wagmi codegen)
- `src/generated.ts` is produced by `wagmi.config.ts` (`@wagmi/cli` `foundry` plugin reading Foundry artifacts from `../chain` + the `react` plugin). **Do not hand-edit it.**
- Regenerate after contract ABI changes: `pnpm generate:wagmi` (from `app/`) or `pnpm --filter tap-app generate:wagmi` (from root). The contracts must be built first (`pnpm setup`, or `forge build` in `chain/`).
- Consume hooks via `src/config/contracts.ts` (which re-exports the ones the app uses) or import from `../generated` directly.

### Onchain Data Conventions
These mirror the rules in the root `WARP.md` — keep them in sync.
- **Fixed-point scaling**: scale `quantity` and `share_price` by `1e10` on the **write** side (`DECIMAL_SCALE` in `contracts.ts`, `scaleAmount` in `useDirectIssueStock.ts`). The poller unscales by `1e10`, so skipping this produces tiny fractions in Mongo.
- **UUID ↔ bytes16**: use `uuidToBytes16`, `bytes16ToUuid`, and `generateBytes16Id` from `src/utils/uuid.ts` for any id sent to / read from a contract.
- **Two write paths**:
  - *Direct wallet* (current default for `/manage`): `useDirect*` hooks submit the tx from the connected wallet, then the matching `registerXxxOnchain` service POSTs metadata to `/<entity>/register-onchain`. The poller stays authoritative.
  - *Server-signed* (legacy): `create*` services POST to `/<entity>/create` and the server's OPERATOR key submits onchain.
- **API access**: the frontend calls `/api/*`; `next.config.js` rewrites that to `NEXT_PUBLIC_API_URL` (default `http://localhost:8293`).

### Theming

The theme is defined in `src/components/theme.tsx` and typed in `styled.d.ts`. Token groups:

- `colors`: background, main, input, text, accent, outline, success, successBg, error, errorBg, pending, pendingBg
- `fontSizes`: H1, H2, H3, large, medium, baseline, small
- `lineHeights`: H1, H2, H3, P
- `fontWeights`: normal (400), medium (500), semibold (600), bold (700)
- `spacing`: 0, xs, sm, md, lg, xl, 2xl, 3xl
- `borderRadius`: none, main — plus `radii`: none, main, sm, md
- `breakpoints`: sm (475px), mobile (512px), tablet (768px), mintCollapse (900px)
- `shadows`: sm, focus
- `transitions`: default, spring
- `maxWidths`: main, article, h1
- `zIndices`: base, dropdown, modal

**Note:** `fontWeights` are `normal`, `medium`, `semibold`, `bold` — there is no `thin` or `light`.

## Styled-Components Style Guide

### File Organization
- **Pure styled-component files** use **lowercase** filenames grouped by concern: `buttons.tsx`, `forms.tsx`, `typography.tsx`, `wrappers.tsx`.
- **Component files with React logic/hooks** use **PascalCase**: `Navbar.tsx`, `CapTableDashboard.tsx`, `IssueStockForm.tsx`.
- One file per concern — don't mix buttons and form inputs in the same file.
- Inline styled components inside PascalCase component files are acceptable when only used there (e.g. `NavActions` inside `Navbar.tsx`).

### Naming & Exports
- Use `const Name = styled.element` syntax.
- Pure styled-component files use **named exports** grouped at the bottom of the file.
- Avoid `default export` for files that only export styled components.

### Theme Tokens
- Always use theme tokens via `${({ theme }) => theme.colors.main}` — never hard-code values that exist in the theme (colors, sizes, line heights, radii, spacing, shadows, breakpoints, transitions, z-indices).
- **Status colors**: use `theme.colors.success`, `error`, `pending` for borders and `successBg`, `errorBg`, `pendingBg` for backgrounds.
- If you need a new token, add it to `theme.tsx` and `styled.d.ts` first — don't inline raw values.
- `fontWeights` only supports `normal`, `medium`, `semibold`, `bold`.

### CSS Conventions
- **Indentation**: tabs (consistent with project Prettier config).
- **Transitions**: prefer `theme.transitions.default` (standard UI) and `theme.transitions.spring` (bounce) over inline cubic-beziers. The underlying curves are `cubic-bezier(0.211, 0.69, 0.313, 1)` and `cubic-bezier(0.68, -0.55, 0.27, 1.55)`.
- **Breakpoints**: prefer `theme.breakpoints.*` (`sm` 475px, `mobile` 512px, `tablet` 768px, `mintCollapse` 900px) over raw pixel values.
- **Transient props**: use `$` prefix (e.g. `$variant`) per styled-components v6 convention to avoid passing props to the DOM.
- **`flex-flow` shorthand**: prefer `flex-flow: row nowrap` over separate `flex-direction` + `flex-wrap`.

### Where New Code Goes
- Buttons → `buttons.tsx`; form inputs/labels/field layouts → `forms.tsx`; typography → `typography.tsx`; layout containers/wrappers/panels → `wrappers.tsx`; global styles → `globalstyle.tsx`; theme → `theme.tsx`.
- React components with logic → PascalCase files in `src/components/`.
- Wallet/onchain hooks → `src/hooks/`.
- API client wrappers → `src/services/`.
- Web3 + runtime config → `src/config/`.
- Sample/seed data → `src/samples/`.

## Coding Conventions

### TypeScript / TSX
- Tab indentation, double quotes for strings.
- Named exports for styled-component files; `default export` for page/component files with logic.
- Use the `type` keyword for type-only exports (`export type { ... }`).
- Keep pages in `src/pages/`, reusable UI in `src/components/`, hooks in `src/hooks/`, API wrappers in `src/services/`, config in `src/config/`, sample data in `src/samples/`.
- Avoid creating `features/` directories — use the folders above.
- Never hand-edit `src/generated.ts`; regenerate with `pnpm generate:wagmi`.

### Solidity
The frontend contains no Solidity. For contract conventions (NatSpec, custom errors, events, roles, snake_case OCF fields) and the smart-contract toolchain, see the root [`WARP.md`](../WARP.md).

## Environment Variables

Frontend config lives in `app/.env.local` (git-ignored — never commit secrets). All are build-time public (`NEXT_PUBLIC_*`):

- `NEXT_PUBLIC_REOWN_PROJECT_ID` — Reown/WalletConnect project id (https://cloud.reown.com)
- `NEXT_PUBLIC_FACTORY_ADDRESS` — deployed `CapTableFactory` address
- `NEXT_PUBLIC_CHAIN_ID` — chain the frontend targets (e.g. 98866 Plume Mainnet)
- `NEXT_PUBLIC_API_URL` — API server URL the `/api/*` rewrite proxies to (default `http://localhost:8293`)
- `NEXT_PUBLIC_OPERATOR_ADDRESS` — server wallet to receive OPERATOR_ROLE on new cap tables

See the root `.env.example` for the canonical list.

## Git Workflow

PR titles should follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) (e.g. `feat(ui): add new component`). Branch from `main`; see the root [`CONTRIBUTING.md`](../CONTRIBUTING.md).
