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
pnpm test:e2e         # Playwright e2e (root: pnpm app:test:e2e)
pnpm test:e2e:ui      # Playwright UI mode
pnpm generate:wagmi   # Regenerate src/generated.ts from chain ABIs
```

`pnpm build` runs `next build` then `next-sitemap` (postbuild). The root `pnpm typecheck` includes this app via `typecheck:app`.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (Pages Router), React 19
- **Styling**: styled-components v6 with `ThemeProvider`
- **Wallet / web3**: wagmi v3 + viem v2, with Reown AppKit (`@reown/appkit`, `@reown/appkit-adapter-wagmi`) for the connect modal
- **Data fetching**: TanStack Query (`@tanstack/react-query`)
- **Fonts**: Inter (UI copy) + IBM Plex Mono (data — numbers, addresses, tables), loaded via `next/font` as CSS variables (`--font-sans` / `--font-mono`)
- **E2E**: Playwright (`e2e/`, mocked `/api/*`, desktop + iPad + iPhone projects)
- **Sitemap**: `next-sitemap` (postbuild)

### Project Structure
- `src/pages/` — `_app.tsx` providers + fonts; `_document.tsx`; `index.tsx` (landing); `app/companies/`, `app/mint.tsx`; legacy `mint.tsx` / `manage/*` redirects.
- `src/components/` — design system (lowercase styled files), shell, shared components, and **`cap-table/`** feature module:
  - Design system: `theme.ts`, `global-style.ts`, `typography.tsx`, `elements.tsx`, `forms.tsx`, `layout.tsx` (+ `PageHeader.tsx`)
  - `shell/` — `AppShell` (shell root), `TopBar` (system bar), `SideNav` (working nav), `AppShellContext`, `navConfig`, `WalletButtonClient`
  - `cap-table/` — `CapTableDashboard.tsx` orchestrator (wallet writes, refresh, activity); `views/*` (Holdings, Shareholders, StockClasses, IssueStock, TransferStock, Transactions); `forms/*` (domain forms: Issuer, Stakeholder, StockClass, IssueStock, TransferStock, MintActions, IssuerHeader, HoldingsTable); `OwnershipBar`, `SetupChecklist`, `ownershipModel`, `types`
  - Shared list UI: `DataTable` + `Table` / `TableFrame` (full-width framed tables); `Modal`, `TxSuccessModal`
- `e2e/` — Playwright specs + `mocks.ts` fixtures (`playwright.config.ts` at app root)
- `src/hooks/` — `useMintIssuer`, `useDirectCreateStockClass`, `useDirectCreateStakeholder`, `useDirectIssueStock`, **`useDirectTransferStock`**, `useOnchainAction`, `useResource`, `useCapTableManager`
- `src/services/` — typed `fetch` wrappers: `registerIssuer`, `register*Onchain`, `fetchHistoricalTransactions`
- `src/lib/copy.ts` — product copy (human labels; no poller/devops jargon in UI)
- `src/utils/` — `uuid.ts` (`@tap/units`); `activityLog`, `myIssuers`, `holdingStatus`, etc.
- `src/config/` — `wagmi.ts`, `Web3Provider.tsx`, `contracts.ts`
- `src/generated.ts` — **generated** wagmi hooks (do not hand-edit)
- `styled.d.ts` — theme type augmentation

### Wallet & Web3 Integration
- Provider nesting in `src/pages/_app.tsx`: `Web3Provider` → `ThemeProvider` (+ `GlobalStyle`) → `AppShellProvider` → `AppShell`.
- **Nav roles are strict**: the **side nav** (`shell/SideNav`) is the *working* navigation (app destinations + company sections + doc links); the **top bar** (`shell/TopBar`) is *system-only* (brand + wallet now; sign-in/security later). Page identity ("where am I") lives in the in-page `PageHeader`, never the top bar.
- Side nav collapses to a slim rail on desktop (toggle on the nav edge, `nav-collapse-toggle`); on phone widths (≤768px) it becomes an overlay drawer opened from the top bar (`mobile-nav-toggle`). iPad portrait (810px) keeps the persistent sidebar.
- Shell only appears on **workspace** routes (`isWorkspaceRoute` → `/app/*`). Landing has no side nav and no wallet.
- Cap-table sections are side-nav destinations via `?view=` on `/app/companies/[issuerId]`. Section order: Holdings → Stock classes → Shareholders → Issue stock → Transfer → Transactions.
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
- **Scale**: `DataTable` supports opt-in per-column sorting (`sortValue`) and incremental pagination (`pageSize` + "Show N more"). Holdings adds search and a "By holding | By shareholder" toggle (grouped mode aggregates one person's positions across classes); Shareholders adds search plus Total shares / Holdings columns. All client-side — the holdings endpoint returns the full set. **Follow-up past ~1k holders: server-side pagination/search on `/cap-table/holdings/stock`.**
- Forms open on demand (Add shareholder / Add stock class); setup checklist on empty holdings (class → person → issue).
- Ownership bar on Holdings when positions exist: scales to authorized shares (hatched Unissued tail), names the top holders globally, colors segments per shareholder, and caps the tiny-slice legend at 6 entries + a "+N more" summary chip.
- Activity log (localStorage) + historical transactions with explorer TX links.
- Human copy only — see `lib/copy.ts`.

### Theming

The theme is defined in `src/components/theme.ts` and typed in `styled.d.ts`. Design direction: **strict ledger** — monochrome white-opacity gray ramp on near-black, one lime accent (`#c8f542`), 0 radius, 1px hairlines, 4px spacing grid. Token groups:

- `colors`: background, surface, elevated, border, borderStrong, text, textMuted, textSubtle, accent, accentMuted, onAccent, success/successBg, error/errorBg, pending/pendingBg, overlay, inverse
- `fonts`: sans (Inter — UI copy), mono (IBM Plex Mono — numbers, addresses, tables, inputs)
- `fontSizes`: H1, H2, H3, large, medium, baseline, small, xs
- `lineHeights`: H1, H2, H3, P
- `fontWeights`: normal (400), medium (500), semibold (600), bold (700)
- `spacing`: strict 4px grid — 0, xs (4), sm (8), md (12), lg (16), xl (24), 2xl (32), 3xl (48), 4xl (64)
- `radii`: none only (sharp ledger — 0 radius everywhere)
- `breakpoints`: device-anchored — phone (430px, iPhone), tablet (768px, iPad portrait threshold), tabletLandscape (1024px), desktop (1200px)
- `shadows` (overlay, focus), `transitions` (default, slow), `maxWidths` (text ~680px, form, content), `zIndices`, `layout` (navWidth, topBar)

**Notes:** `fontWeights` are `normal`, `medium`, `semibold`, `bold` — no `thin`/`light`. There is no `colors.main`/`muted`/`subtle`/`outline`/`input` anymore — use `accent`/`textMuted`/`textSubtle`/`border`/`surface`.

## Styled-Components Style Guide

### File Organization
- **Pure styled-component files** use **lowercase** filenames, one concern per file: `typography.tsx`, `elements.tsx` (buttons, panels, tables, status), `forms.tsx` (inputs), `layout.tsx` (page scaffolding).
- **Component files with React logic/hooks** use **PascalCase**: `shell/TopBar.tsx`, `cap-table/CapTableDashboard.tsx`, `cap-table/forms/IssueStockForm.tsx`, `PageHeader.tsx`.
- One file per concern — don't mix buttons and form inputs in the same file.
- Inline styled components inside PascalCase files are fine when local-only.
- **One Button**: `Button` from `elements.tsx` with `$variant` (primary | secondary | danger | ghost), `$size` (md | lg), `$block`. Never add a second button component.
- **Grid discipline**: pages compose `Page` / `PageHeader` / `Section` / `Stack` / `Grid` from `layout.tsx` — no ad-hoc margins in views.

### Naming & Exports
- Use `const Name = styled.element` syntax.
- Pure styled-component files use **named exports** grouped at the bottom of the file.
- Avoid `default export` for files that only export styled components.
- Public barrel: `src/components/index.ts` (do not re-export dead modules).

### Theme Tokens
- Always use theme tokens via `${({ theme }) => theme.colors.accent}` — never hard-code values that exist in the theme.
- **Status colors**: `theme.colors.success` / `error` / `pending` and matching `*Bg` tokens (or `StatusMessage` from `elements.tsx`).
- **Data is mono**: numbers, addresses, tx hashes use `theme.fonts.mono` (`Mono` span, `Table` cells, inputs already do).
- New tokens go in `theme.ts` + `styled.d.ts` first.
- `fontWeights` only supports `normal`, `medium`, `semibold`, `bold`.

### CSS Conventions
- **Indentation**: tabs (Prettier).
- **Transitions**: `theme.transitions.default` / `slow` (no `spring`).
- **Breakpoints**: `theme.breakpoints.*` over raw pixels.
- **Transient props**: `$` prefix (e.g. `$variant`).
- **`flex-flow` shorthand**: prefer `flex-flow: row nowrap`.

### Where New Code Goes
- Buttons/panels/tables/status → `elements.tsx`; inputs → `forms.tsx`; type → `typography.tsx`; page scaffolding → `layout.tsx`; tokens → `theme.ts`.
- App chrome (top bar, side nav, shell) → `src/components/shell/`.
- Company workspace views/logic → `src/components/cap-table/` (domain forms in `cap-table/forms/`).
- Wallet/onchain hooks → `src/hooks/` (`useDirect*` pattern).
- API client wrappers → `src/services/`.
- Product strings → `src/lib/copy.ts`.
- Web3 + runtime config → `src/config/`.
- E2E specs → `e2e/` (mock `/api/*` via `e2e/mocks.ts`; never require Mongo/chain).

## E2E Testing

Playwright suite in `e2e/` (`pnpm test:e2e`, UI mode `pnpm test:e2e:ui`):
- Runs against a **production build** on port 3100 (`playwright.config.ts` webServer) — the dev overlay portal intercepts clicks, so don't switch it back to `next dev`.
- Three projects: `desktop` (Chrome), `ipad` (iPad gen 7 viewport), `iphone` (iPhone 13 viewport) — all Chromium.
- All `/api/*` traffic is mocked with `page.route` fixtures in `e2e/mocks.ts`; the companies list is seeded via `tap_my_issuers` localStorage.
- Wallet flows are tested up to the connect gate (no real wallet in CI).
- Gate viewport-dependent tests by width against the 768px drawer breakpoint, not Playwright's `isMobile` (iPad portrait is 810px and keeps the persistent sidebar).

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
