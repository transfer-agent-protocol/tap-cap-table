# First-principles Rebuild Plan for the Cap Table Manager

**Status**: Analysis complete. Plan revised and verified. (See local session goal plan for audit trail.)

This is the canonical first-principles plan for dramatically simplifying the TAP cap table architecture (frontend + server) so that:

1. The frontend app can be **completely refactored** using new components that properly sync offchain (Mongo) and onchain data.
2. The system becomes **dramatically easier for developers** to work with.

**Source of truth = chain.** Mongo mirrors via the poller (which lags on fast chains like Plume → "pending sync"). A per-issuer fast-forward tool exists.

## Hard-won Facts (baked in, proven)

- Source of truth = chain; Mongo mirrors via the poller, which lags on fast chains → "pending sync." A per-issuer fast-forward tool exists.
- All shares/prices are **1e10 fixed-point** on the write side. Unscaled values silently break issuance and show tiny fractions in Mongo.
- Issuance is bounded by `issuer.shares_authorized` **AND** the stock class's authorized. A class authorized above the issuer is allowed at creation but issuance reverts — the exact bug that read as "sync broken."
- Onchain writes can revert after a successful "submit." The UI **must** confirm the receipt, not show optimistic success.
- Factory/impl addresses are deployment-specific (owner = deployer wallet; impl = upgradeable beacon target). **Never hardcode**; `deploy-factory` should auto-register.
- Docker app bakes source (goes stale on rebuild); **frontend dev = `pnpm app:dev`**.
- The browser "Failed to fetch" was an ad-blocker on wallet analytics, not the API.

## Current Insanity (what we are escaping)

Inspected on `feat/refactor-frontend-improve-ui` (seed commits: `4b7ee76` useResource+DataTable+copy, `b08a136` Holdings rebuild + auto-refresh, `d04194f` receipt confirmation + revert surfacing).

Key problems identified from code, WARP.md (root + app/), and **every file** under `docs/src/pages/`:

- **Dual write paths** persisting everywhere:
  - Legacy server-signed: `POST /<entity>/create` (server OPERATOR key calls contract via controllers).
  - Direct-wallet (intended for /manage): wallet submits via `useDirect*`, then `POST /<entity>/register-onchain`.
  - Services (`create*.ts`) often implement *both*. Docs heavily push `/create` + separate `/issuer/register`. `useCapTableManager` still exposes legacy creates.
- **Controller explosion + OCF bloat**: 11 controllers (issuer/stakeholder/stockClass + 7 transaction types + seed). Each does UUID→bytes16 + scaling + contract call. XState state-machines (3 files) model lifecycle in poller/seed.
- **Scaling disaster**: Many docs + controllers.mdx + api-ref still say ×10000 ("divide raw onchain by 10000"). Real code is 1e10 (`DECIMAL_SCALE`, `decimalScaleValue`). Mismatch = broken issuance + tiny Mongo values.
- **Optimistic/pending lies**: Pre-seed, "success on submit" + rows stuck forever in "Pending sync" on revert (no `useWaitForTransactionReceipt`). Manual refresh required.
- **Factory hell**: Docs tell you to manually insert into Mongo via Compass (and show stale Plume hardcoded addresses). Reality: deployment-specific, owner controls beacon, `pnpm deploy-factory` auto-registers, separate sources for server (Mongo factories) vs frontend (`app/.env.local`).
- Other: bespoke tables + inline styles + misleading success modals, no shared units/validation module (duplicated logic), poller lag not handled gracefully in UX, overly complex server (routes + controllers + db/ops + state-machines + chain-ops), frontend still has remnants of both flows.

The current branch seed work (`useResource`, generic `DataTable`, centralized `copy`, auto-revalidate while pending, receipt confirmation) is the **seed, not the foundation**. It must be folded into the real layers.

## The Plan (First Principles, ≤10 Steps)

1. **PRD + invariants doc**  
   Define users (operator-of-many-cap-tables, issuer/admin), the jobs (mint → stock classes → stakeholders → issue/transfer/cancel → view holdings/activity), non-goals, and the source-of-truth model.  
   List domain invariants explicitly (this is the contract everything is tested against).

2. **One shared units/validation module (client + server)**  
   1e10 scaling helpers, share-cap checks (issuance ≤ issuer authorized **and** class authorized; class ≤ issuer), UUID↔bytes16, OCF validation.  
   UI blocks bad input before signing; server rejects it too.

3. **Onchain action contract**  
   A single `useOnchainAction` wrapper: `write → useWaitForTransactionReceipt → decode revert reason → reconcile`.  
   **Never** "success on submit". Optimistic rows are provisional and dropped on revert.

4. **Data layer**  
   `useResource<T>` (abort + request-id + stale-while-revalidate) + auto-revalidate while pending.  
   One thin `/api/*` route per resource → `server/db/operations`.  
   Distinct loading/error/empty on every surface.  
   Mongo stays; read **live chain state** (e.g. `getAveragePosition`) where authoritative.

5. **Sync decision (pin it in the PRD)**  
   Choose and document one:  
   - (current) Poller + client auto-refresh + fast-forward tool, **or**  
   - Read positions directly from chain with Mongo as a metadata cache.  
   Define target latency and the operator runbook.

6. **Design system**  
   `components/ui` built on theme tokens (containers, text, forms, buttons, generic `DataTable<T>`) + centralized copy.  
   Delete bespoke tables, inline styles, and misleading "success" modals/copy.  
   styled-components only (follow app/WARP.md rules).

7. **Screens rebuilt to the PRD**  
   Mint, `/manage` hub, `/manage/cap-table` (forms + holdings + activity) — each with real states and accurate status (`Onchain` / `Pending` / `Reverted`).  
   **Collapse the `/create` vs `/register-onchain` duality** to one direct-wallet flow.

8. **Operator first-touch**  
   One-command bootstrap.  
   Factory deployed + auto-registered from the operator wallet (never hardcoded; owner controls the beacon).  
   Clear env model (frontend = `app/.env.local`, server = Mongo factories).  
   Document `pnpm app:dev` as the frontend dev path.

9. **Tests & guardrails**  
   Unit-test the units/validation module.  
   Integration-test the issue-stock happy path + the over-authorized revert.  
   Playwright e2e for mint→class→stakeholder→issue→Onchain.  
   lint/typecheck/tests in CI.

10. **Migration**  
    Fresh branch off `main` once PR #251 (server stakeholders, scaling fix, ops tooling) lands.  
    Land units/validation + data layer + action wrapper + design system **first**, then screens.  
    Delete dead code/requirements as you go.  
    The `feat/refactor-frontend-improve-ui` work (useResource, DataTable, auto-refresh, receipt confirmation) is the seed — fold its ideas into steps 3/4/6.

## Acceptance Criteria (for the analysis + plan update work)

(See the full verified local plan.md for the exact gating criteria that were satisfied.)

## Verification (what was executed)

- Branch/commits/WARP.md/app/WARP.md + **all** `docs/src/pages/` files inspected.
- Explicit insanity sources called out.
- Hard facts baked verbatim.
- 10-step plan + sync decision + units module + collapse + sequencing pinned.
- Plan.md produced as single source of truth (outcome-based, observable criteria).
- Full Verification plan run (reads + evidence tool calls); all observations confirmed to hold.
- Durable proof written to private scratch dir.

## Non-goals (for the analysis phase)

- Implementing the architecture changes, PRD, components, or tests (this run was analysis + plan authoring only).
- Changing smart contracts or onchain behavior.
- Removing Mongo or the poller (only pin the decision).
- End-to-end manual app exercising.

## Next (after this analysis)

Follow the 10 steps in order. Land core layers (2-6) before big screen rewrites (7). Use the current seed work as input, not the foundation.

---

**This document is the living plan.** The local session artifact (`/Users/alexpalmer/.grok/sessions/.../goal/plan.md`) was the working source during execution and contains additional verification evidence + full checklist.

**How to use in Warp Notebook**:
- Copy the body of this file into the notebook editor.
- Use `/` or markdown to turn sections into proper elements (headings, lists, code blocks for commands like `pnpm app:dev`).
- Add runnable command blocks for key bootstrap/dev steps where useful.