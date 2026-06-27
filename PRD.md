# PRD — Cap Table Manager (rebuild)

Step 1 of the first-principles rebuild plan. This is the contract every other layer is
built and tested against. Keep it short; change it deliberately.

## Product
A web app for a **transfer-agent operator that manages many cap tables**. It mints onchain
cap tables and manages their lifecycle (stock classes, stakeholders, issuance/transfer/
cancel) with the chain as the system of record.

## Users & jobs
- **Operator** (runs the stack; server wallet): deploys/owns the factory, runs the API +
  poller, can act as OPERATOR on cap tables.
- **Issuer / admin** (connected wallet): mints a cap table (becomes ADMIN) and performs its
  day-to-day actions directly from their wallet.
- **Core jobs:** mint issuer/cap table → create stock classes → create stakeholders →
  issue / transfer / cancel stock → view holdings + activity.

## Source of truth
- **The chain is authoritative.** MongoDB is a *mirror/metadata cache* populated by the
  event poller. Reads that must be exact (positions) come from the contract
  (`getAveragePosition`); Mongo supplies OCF metadata and fast lists.

## Domain invariants (MUST hold everywhere — client + server)
1. **Fixed-point scaling is 1e10** for all share quantities and prices on the **write**
   side; the poller unscales by 1e10 on read. (Docs that say ×10000 are WRONG — fix them.)
   Use BigInt math for share counts to avoid float precision loss above 2^53.
2. **Authorized-share caps:** issuance succeeds only if
   `issuer.shares_issued + qty ≤ issuer.shares_authorized` **and**
   `stockClass.shares_issued + qty ≤ stockClass.shares_authorized`. A stock class may be
   created with more authorized than the issuer, but issuance is still bounded by the
   issuer total — validate/warn at creation, block at issuance **before** signing.
3. **IDs:** UUIDs are stored as `bytes16` onchain; convert with the shared helpers. The
   same id is used for the onchain tx and the offchain metadata record.
4. **OCF:** all entity payloads validate against the OCF schema (client and server).
5. **One write path:** direct-wallet only (`useDirect*` → contract → `/<entity>/register-
   onchain` for metadata; the poller is authoritative for the canonical record). The legacy
   server-signed `/create` path is removed.
6. **Transaction lifecycle:** every onchain write is **submit → confirm receipt → reconcile**.
   Never show success on submit. Surface revert reasons. Optimistic rows are provisional and
   dropped on revert.
7. **Factory config is deployment-specific:** factory address derives from the deployer
   wallet+nonce; implementation is an upgradeable **beacon** target (read live, never
   hardcode). The factory **owner** (deployer wallet) controls beacon upgrades for all its
   cap tables — only reuse a factory you own. Server reads the factory from Mongo
   `factories`; frontend from `app/.env.local`; keep them in sync.

## Non-goals (for the rebuild)
- Replacing the Solidity contracts, MongoDB, styled-components, or the `/api` proxy.
- A public multi-tenant SaaS, auth/roles UI, or billing.
- Reintroducing the server-signed `/create` flow or per-entity controllers/XState beyond
  what the poller needs.

## Architecture decisions
- **Data layer:** one `useResource<T>` (AbortController + request-id guard + stale-while-
  revalidate) + auto-revalidate while rows are pending; one thin `/api/*` route per resource
  → `server/db/operations`; distinct loading / error / empty on every surface.
- **Onchain actions:** one `useOnchainAction` wrapper implementing invariant #6.
- **Units/validation:** one shared module implementing invariants #1–#4, imported by both
  the UI (pre-sign blocking) and the server (rejection).
- **Design system:** `components/ui` on theme tokens + a generic `DataTable<T>` + centralized
  copy; styled-components only (per `app/WARP.md`). No bespoke tables, inline styles, or
  "success-on-submit" modals.
- **Server shape:** thin routes → `db/operations`; the poller mirrors events. Prune the 11
  controllers + 3 XState machines toward this.

## Open decision (pin before building screens)
**Sync strategy** — choose one and document target latency + operator runbook:
- (A) Poller + client auto-refresh + per-issuer fast-forward tool (current), or
- (B) Read positions directly from chain; Mongo is only a metadata cache.

## Status / dev notes
- Frontend dev = `pnpm app:dev` (the Docker `app` bakes source and goes stale on rebuild).
- Seed work on `feat/refactor-frontend-improve-ui` (`useResource`, `DataTable`, auto-refresh,
  receipt confirmation, 1e10 stock-class scaling) is a *seed* to fold into the real layers,
  not the foundation.
- Build the rebuild on a fresh branch off `main` once PR #251 (server stakeholders, scaling
  fix, ops tooling) lands.
