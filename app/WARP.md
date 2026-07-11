# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Transfer Agent Protocol (TAP) frontend — the `tap-app` workspace. Marketing landing plus a wallet-based product for minting and managing onchain cap tables.

### Routes

| Path | Role |
|------|------|
| `/` | Marketing landing (docs, GitHub, demo contracts). **No** product shell, **no** wallet. |
| `/app` / `/app/companies` | Companies list (wallet shell). Load from wallet + local list. |
| `/app/mint` | Deploy a new cap table from the connected admin wallet. |
| `/app/companies/[issuerId]?view=` | Company workspace: holdings, stock classes, shareholders, issue, **transfer**, transactions. |
| `/mint`, `/manage`, `/manage/*` | **Legacy redirects** → `/app/*`. Prefer `/app` in new code. |

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
pnpm test:nav         # nav + ownership + activity unit tests (node:test)
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
- `src/pages/` — `_app.tsx` providers; `_document.tsx`; `index.tsx` (landing); `app/companies/`, `app/mint.tsx`; legacy `mint.tsx` / `manage/*` redirects.
- `src/components/` — shell (`Navbar`, `LeftNavDrawer`, `layout`, `navConfig`), shared forms/tables, and **`cap-table/`** feature module:
  - `CapTableDashboard.tsx` — orchestrator (wallet writes, refresh, activity)
  - `views/*` — Holdings, Shareholders, StockClasses, IssueStock, TransferStock, Transactions
  - `OwnershipBar`, `SetupChecklist`, `ownershipModel`, `types`
  - Shared list UI: `DataTable` + `StyledTable` / `TableScroll` (full-width framed tables)
- `src/hooks/` — `useMintIssuer`, `useDirectCreateStockClass`, `useDirectCreateStakeholder`, `useDirectIssueStock`, **`useDirectTransferStock`**, `useOnchainAction`, `useResource`, `useCapTableManager`
- `src/services/` — typed `fetch` wrappers: `registerIssuer`, `register*Onchain`, `fetchHistoricalTransactions`
- `src/lib/copy.ts` — product copy (human labels; no poller/devops jargon in UI)
- `src/utils/` — `uuid.ts` (`@tap/units`); `activityLog`, `myIssuers`, `holdingStatus`, etc.
- `src/config/` — `wagmi.ts`, `Web3Provider.tsx`, `contracts.ts`
- `src/generated.ts` — **generated** wagmi hooks (do not hand-edit)
- `styled.d.ts` — theme type augmentation

### Wallet & Web3 Integration
- Provider nesting in `src/pages/_app.tsx`: `Web3Provider` → `ThemeProvider` (+ `GlobalStyle`) → `AppShellProvider` → `Layout`.
- **App shell**: left collapsible nav (`LeftNavDrawer` + `navConfig`) and top bar (brand + wallet) only on **workspace** routes (`isWorkspaceRoute` → `/app/*`). Landing has no left drawer and no wallet.
- Cap-table sections are left-nav destinations via `?view=` on `/app/companies/[issuerId]`. Section order: Holdings → Stock classes → Shareholders → Issue stock → Transfer → Transactions.
- **Issuer id in links**: build hrefs with `capTableHref(issuerId, view)` using the real id from `router.query.issuerId` (or path). Never embed `router.pathname` when it still contains `[issuerId]`.
- `src/config/wagmi.ts` — Reown AppKit + WagmiAdapter. Networks: **Plume Mainnet (98866)**, **Plume Testnet (98867)**, **Anvil (31337)**. Requires `NEXT_PUBLIC_REOWN_PROJECT_ID`.

### Contract Bindings (wagmi codegen)
- `src/generated.ts` is produced by `wagmi.config.ts` (`@wagmi/cli` foundry + react plugins). **Do not hand-edit it.**
- Regenerate after ABI changes: `pnpm generate:wagmi` (from `app/`) or `pnpm --filter tap-app generate:wagmi` (from root). Contracts must be built first (`pnpm setup` / `forge build` in `chain/`).
- Prefer `useWriteCapTable*` hooks from `generated` (or re-exports in `config/contracts.ts`).

### Onchain Data Conventions
These mirror the rules in the root `WARP.md` — keep them in sync.
- **Fixed-point scaling**: scale `quantity` and `share_price` by **1e10** on the write side via `@tap/units` (`scaleShares` / `scaleAmount`). Poller unscales by 1e10.
- **UUID ↔ bytes16**: `uuidToBytes16`, `bytes16ToUuid`, `generateBytes16Id` from `@tap/units` (via `src/utils/uuid.ts`).
- **Share caps**: pre-sign with `validateShareCaps` from `@tap/units` (issuer remaining **and** class remaining) for issuances.
- **One write path (manage UI)**: `useDirect*` + `useOnchainAction` (submit → wait receipt → success/reverted). Then:
  - Class / stakeholder / issuance → `registerXxxOnchain` (metadata + `is_onchain_synced` + `tx_hash`)
  - **Transfer** → wallet `transferStock` only; poller writes `StockTransfer` (mirrors server `transferController` scaling; no UI call to `POST /transactions/transfer/stock`)
- Legacy server-signed `/create` and transfer API routes exist for docs/API tooling, not the product UI.
- **API access**: frontend calls `/api/*`; `next.config.js` rewrites to `NEXT_PUBLIC_API_URL` (default `http://localhost:8293`).
- **Refresh**: UI “Refresh” should reconcile flags/TX hashes + reload holdings/history — do not routinely fast-forward the poller to head (skips events → ghost classes).

### Company workspace UX
- Table-first lists (`DataTable`) full width of the main column (no artificial 72rem content cap on product pages).
- Forms open on demand (Add shareholder / Add stock class); setup checklist on empty holdings (class → person → issue).
- Ownership bar on Holdings when positions exist.
- Activity log (localStorage) + historical transactions with explorer TX links.
- Human copy only — see `lib/copy.ts`.

### Theming

The theme is defined in `src/components/theme.tsx` and typed in `styled.d.ts`. Token groups:

- `colors`: background, surface, elevated, main, input, text, muted, subtle, accent, outline, borderStrong, success, successBg, error, errorBg, pending, pendingBg, overlay, inverse
- `fontSizes`: H1, H2, H3, large, medium, baseline, small, xs
- `lineHeights`: H1, H2, H3, P
- `fontWeights`: normal (400), medium (500), semibold (600), bold (700)
- `spacing`: 0, xs, sm, md, lg, xl, 2xl, 3xl
- `borderRadius` / `radii`: none (sharp ledger — 0 radius)
- `breakpoints`: sm (475px), mobile (512px), tablet (768px), mintCollapse (960px), desktop (1200px)
- `shadows`, `transitions`, `maxWidths`, `zIndices`, `layout` (navWidth, topBar)

**Note:** `fontWeights` are `normal`, `medium`, `semibold`, `bold` — there is no `thin` or `light`.

## Styled-Components Style Guide

### File Organization
- **Pure styled-component files** use **lowercase** filenames grouped by concern: `buttons.tsx`, `forms.tsx`, `typography.tsx`, `wrappers.tsx`.
- **Component files with React logic/hooks** use **PascalCase**: `Navbar.tsx`, `cap-table/CapTableDashboard.tsx`, `IssueStockForm.tsx`, `TransferStockForm.tsx`.
- One file per concern — don't mix buttons and form inputs in the same file.
- Inline styled components inside PascalCase files are fine when local-only.

### Naming & Exports
- Use `const Name = styled.element` syntax.
- Pure styled-component files use **named exports** grouped at the bottom of the file.
- Avoid `default export` for files that only export styled components.
- Public barrel: `src/components/index.ts` (do not re-export dead modules).

### Theme Tokens
- Always use theme tokens via `${({ theme }) => theme.colors.main}` — never hard-code values that exist in the theme.
- **Status colors**: `theme.colors.success` / `error` / `pending` and matching `*Bg` tokens.
- New tokens go in `theme.tsx` + `styled.d.ts` first.
- `fontWeights` only supports `normal`, `medium`, `semibold`, `bold`.

### CSS Conventions
- **Indentation**: tabs (Prettier).
- **Transitions**: `theme.transitions.default` / `spring` / `slow`.
- **Breakpoints**: `theme.breakpoints.*` over raw pixels.
- **Transient props**: `$` prefix (e.g. `$variant`).
- **`flex-flow` shorthand**: prefer `flex-flow: row nowrap`.

### Where New Code Goes
- Buttons → `buttons.tsx`; forms → `forms.tsx`; typography → `typography.tsx`; layout → `wrappers.tsx`; theme → `theme.tsx`.
- Company workspace views/logic → `src/components/cap-table/`.
- Wallet/onchain hooks → `src/hooks/` (`useDirect*` pattern).
- API client wrappers → `src/services/`.
- Product strings → `src/lib/copy.ts`.
- Web3 + runtime config → `src/config/`.

## Coding Conventions

### TypeScript / TSX
- Tab indentation, double quotes for strings.
- Named exports for styled-component files; `default export` for pages.
- Use the `type` keyword for type-only exports.
- Keep pages in `src/pages/`, reusable UI in `src/components/`, hooks in `src/hooks/`, API wrappers in `src/services/`, config in `src/config/`.
- Avoid creating top-level `features/` directories — company UI is already under `components/cap-table/`.
- Never hand-edit `src/generated.ts`; regenerate with `pnpm generate:wagmi`.

### Solidity
The frontend contains no Solidity. For contract conventions and toolchain, see the root [`WARP.md`](../WARP.md).

## Environment Variables

Frontend config lives in `app/.env.local` (git-ignored). All are build-time public (`NEXT_PUBLIC_*`):

- `NEXT_PUBLIC_REOWN_PROJECT_ID` — Reown/WalletConnect project id (https://cloud.reown.com)
- `NEXT_PUBLIC_FACTORY_ADDRESS` — deployed `CapTableFactory` address
- `NEXT_PUBLIC_CHAIN_ID` — chain the frontend targets (e.g. 98866 Plume Mainnet)
- `NEXT_PUBLIC_API_URL` — API server URL the `/api/*` rewrite proxies to (default `http://localhost:8293`)
- `NEXT_PUBLIC_OPERATOR_ADDRESS` — server wallet to receive OPERATOR_ROLE on new cap tables

See the root `.env.example` for the canonical list. Keep Mongo `factories` and this factory address aligned.

## Git Workflow

PR titles follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary). Branch from `main`; see the root [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Dev noise (not app bugs)

Next.js dev overlay may show `Runtime TypeError: Failed to fetch` whose stack is `chrome-extension://…` (wallet / Reown analytics blocked by an ad-blocker). That is **not** the TAP API. AppKit analytics is disabled in `src/config/wagmi.ts`; `_app.tsx` filters extension fetch noise. If holdings fail, check the Network tab for `/api/*` — real API errors show HTTP status there.
