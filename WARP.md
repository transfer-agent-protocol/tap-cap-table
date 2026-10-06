# WARP.md

Agent notes for this repository. Read this before changing architecture, contracts, or the write path.

## Project Overview

Transfer Agent Protocol (TAP) Cap Table is an onchain cap table implementation that combines Solidity smart contracts with an offchain Node.js API server. It implements the [Open Cap Table Coalition (OCF)](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard for representing cap table data.

This is a **pnpm monorepo** with the following workspaces:
- `app/` - Next.js frontend (tap-app)
- `docs/` - Nextra documentation site (tap-docs)
- `packages/units` (`@tap/units`) - shared 1e10 scaling, UUID↔bytes16, share-cap validation (app + server)

`ocf/` is a **git submodule** of [transfer-agent-protocol/tap-ocf](https://github.com/transfer-agent-protocol/tap-ocf), used for JSON schemas only. It is **not** a pnpm workspace (its unused docs/jest tree must not enter the lockfile). Pin: `6d8c9322`.

### Licensing

The monorepo (chain, server, app, docs, packages) is **BUSL-1.1** (PALMER.EARTH CORP). Change Date January 1, 2028 → AGPL-3.0+. See root `LICENSE`. Submodules and third-party deps keep their own licenses.


## Architecture

### Hybrid onchain/offchain design

The system maintains a **dual-state architecture**:

- **Onchain (Ethereum/L2)**: Smart contracts (CapTable.sol, CapTableFactory.sol) store authoritative transaction data and active positions
- **Offchain (MongoDB + Node.js)**: Express API server stores OCF-compliant objects and metadata, processes blockchain events

**Critical**: The blockchain is the source of truth for transactions. The offchain database mirrors this state by listening to contract events via the transaction poller.

### Ownership & Role Architecture

The protocol uses a three-tier access model:

- **ADMIN_ROLE** (asset manager's wallet): Grants/revokes roles, manages cap table governance. When created via the factory, `msg.sender` receives ADMIN. Admins are implicitly operators (`_checkOperatorRole` checks both roles).
- **OPERATOR_ROLE**: Optional extra address granted at mint (`NEXT_PUBLIC_OPERATOR_ADDRESS`). Same day-to-day writes as ADMIN. **Not** the server `PRIVATE_KEY`. The product default is the deployer (ADMIN) operates the instance; admins already satisfy operator checks.
- **Factory owner** (wallet that deployed that factory): Controls the `UpgradeableBeacon`, can upgrade the `CapTable` implementation for ALL proxies of **that** factory via `updateCapTableImplementation()`. Has no access to individual cap tables as admin. On the shared Plume demo factory this is `0x366a…` (deploy key). TAP Admin is `0x3601…`. A licensed transfer agent should deploy their own factory so they own upgrades.

**Three keys (do not conflate):** (1) **Factory owner** — cold/infrequent CLI for deploy + beacon upgrades; never the long-running Docker `PRIVATE_KEY`. (2) **Issuer ADMIN** — browser wallet in `/app` that called `createCapTable`. (3) **Server/operator** — optional root `.env` `PRIVATE_KEY` for server-signed API. `deploy-factory` reads the same variable by default and the deploying key becomes the factory owner, so deploy a real factory from a separate env file (`./scripts/deployFactory.sh .env.prod`). `NEXT_PUBLIC_OPERATOR_ADDRESS` is only the **address** granted at mint (no key required on server for wallet-first path). Local `PRIVATE_KEY` is **dev/demo only** (placeholder OK; poller read-only). Full write-up: `docs/src/content/development/setup.mdx` → “Three wallets and keys” (`#three-wallets-keys`).

**Cap table creation** is permissionless — anyone can call `createCapTable()` on the factory. The caller becomes the ADMIN of the new cap table and can optionally designate an OPERATOR address (typically the TAP server) at creation time.

**Access control split:**
- `onlyOperator` (server + admins): `createStockClass`, `createStakeholder`, `createStockLegendTemplate`, `issueStock`, `transferStock`, `repurchaseStock`, `retractStockIssuance`, `reissueStock`, `cancelStock`, `acceptStock`, `addWalletToStakeholder`, `removeWalletFromStakeholder`, `mintActivePositions`, `mintSharesAuthorized`
- `onlyAdmin` (issuer ADMIN only): `addAdmin`, `removeAdmin`, `addOperator`, `removeOperator`, `adjustIssuerAuthorizedShares`, `adjustStockClassAuthorizedShares`

The factory uses OpenZeppelin's `UpgradeableBeacon` — each cap table is a `BeaconProxy`. The factory owner can upgrade all cap tables at once via `updateCapTableImplementation()`.

### Key Components

**Terminology Note**: Throughout this codebase, "stakeholder" follows OCF standard terminology and specifically refers to equity holders on the cap table (those who own shares). This includes individuals (founders, employees, advisors) and institutions (VCs, investors) with equity positions.

1. **Solidity Contracts** (`chain/src/`):
    - `CapTable.sol`: Core contract managing stakeholders, stock classes, transactions, and active positions
    - `CapTableFactory.sol`: Deploys new CapTable instances for issuers
    - Supports: stock issuance, transfers, cancellations, repurchases, reissuances, adjustments
    - **Transfers** that span multiple lots salt issuance/security ids with an in-memory `issuanceOrdinal` (same `nonce`, distinct lots). Do not collapse that back to `generateDeterministicUniqueID` without the ordinal.
    - **Partial repurchase** `balance_security_id` is the remainder certificate id, or `bytes16(0)` when the lot is fully bought back. Not the stakeholder id.
    - **Onchain import helpers** `mintSharesAuthorized` (counters, every current stock class) then `mintActivePositions` (live lots must match those counters) are one-shot. Foundry tests run them back-to-back; do not `issueStock` in between.

2. **Event Poller** (`server/chain-operations/transactionPoller.ts`):
    - Long-running process that polls blockchain for contract events
    - Processes events via `transactionHandlers` into Mongo (authoritative mirror)
    - Synchronizes onchain state to MongoDB
    - Can run in two modes: `--finalized-only` (production) or latest blocks (testing)
    - **Slated for replacement by a proper indexer.** Kept intentionally simple: round-robin across issuers with `runWithConcurrency` (`POLLER_MAX_CONCURRENCY`, default 5). Per-cycle query window is `maxBlocks=5000` (raised from the historical 500 to drain backlog faster on fast chains like Plume) with a `maxEvents=250` safety cap per DB transaction. Do not re-add prioritization/backoff/dynamic-sleep machinery — the indexer will obviate it.

3. **Express API** (`server/app.js`, `server/routes/`):
    - REST endpoints for issuers, stakeholders, stock classes, transactions, etc.
    - Validates input against OCF schemas (`ocf/schema/`)
    - Submits transactions to smart contracts
    - Routes: `/cap-table`, `/factory`, `/issuer`, `/stakeholder`, `/stock-class`, `/transactions`, etc.
    - **Route conventions** for entity creation:
      - `POST /stock-class/register-onchain` and `POST /stakeholder/register-onchain` — **manage UI path after a confirmed wallet receipt**: validates, sets `is_onchain_synced` / `tx_hash`, and persists metadata. Poller remains authoritative.
      - `POST /transactions/issuance/stock/register-onchain` — **manage UI preflight before the wallet tx**: validates OCF metadata and share caps only, reading the caps from `issuer()` and `getStockClassById()` onchain (Mongo `initial_shares_authorized` is never updated by adjustments). It does not persist; the poller writes the canonical issuance from the event.
      - `POST /<entity>/create` — server-signed API/docs path. Signs with root `.env` `PRIVATE_KEY` (local **developer** key) if set. Not the protocol OPERATOR identity and **not** used by the `/app` manage UI. Wallet-first path can leave `PRIVATE_KEY` unset.
    - Issuer helpers for the product UI:
      - `GET /issuer/by-deployer/:address` — list issuers a given admin wallet deployed (`Issuer.deployed_by`).
      - `GET /issuer/full/:id` — full Issuer document (read-only).
      - `POST /issuer/summaries` — readiness stats for company cards (people/classes/issuances/ghost flags).
      - `POST /issuer/reconcile` — flip sync flags against chain + backfill missing `tx_hash` values from logs.
      - `POST /issuer/poller-catchup` — reindex (rebuild cursor from deploy) vs head (fast-forward). Prefer reconcile for UI “Refresh”; reindex only when the mirror is empty/corrupt.
    - Stock transfer: `POST /transactions/transfer/stock` is the **server-signed** API/docs path (`transferController` → `contract.transferStock`). The manage UI does **not** call this; it uses direct-wallet `useDirectTransferStock` (same `StockTransferParams` / scaling). Poller `handleStockTransfer` mirrors either path into Mongo `StockTransfer` + historical rows.

4. **Database Layer** (`server/db/`):
    - Mongoose models for OCF objects (Issuer, Stakeholder, StockClass, VestingTerms, StockTransfer, etc.)
    - Atomic operations with MongoDB transactions when `DATABASE_REPLSET=1`

5. **OCF Submodule** (`ocf/`):
    - Git submodule: [transfer-agent-protocol/tap-ocf](https://github.com/transfer-agent-protocol/tap-ocf) (JSON schemas only). Pin is `6d8c9322` (`ocf_version` `1.2.1-alpha+main`).
    - JSON schemas used for validation
    - Sample OCF files in `ocf/samples/`

6. **Frontend Cap Table Management UI** (`app/src/pages/app/`, `app/src/components/cap-table/`):
    - **Marketing** `/` — landing only (docs, GitHub, demo contracts). No wallet chrome, no product CTAs.
    - **Product** under `/app/*` (wallet + left nav shell):
      - `/app` / `/app/companies` — company list (localStorage + `/issuer/by-deployer` + Load from wallet; summaries for readiness chips).
      - `/app/mint` — deploy a new cap table from the connected admin wallet.
      - `/app/companies/[issuerId]?view=…` — full company workspace. Sections (left nav, setup order): **Holdings** → **Stock classes** → **Shareholders** → **Issue stock** → **Transfer** → **Transactions**.
    - Legacy `/mint` and `/manage*` redirect into `/app/*`.
    - Direct-wallet writes: stock class, shareholder, issuance, **stock transfer** (`useDirect*` + `useOnchainAction`). Class/person metadata is registered after the receipt; issuance uses `/register-onchain` as a validation-only preflight before submission; the poller persists issuance and transfer events — there is no separate transfer register endpoint.
    - UI lives in `components/cap-table/*` (`CapTableDashboard` shell plus screens named after the COMPANY left nav). Product copy in `lib/copy.ts`. Nav config in `navConfig.ts` — always use `query.issuerId` / `asPath` for links, never `router.pathname` with a `[issuerId]` pattern (that produced `%5BissuerId%5D` URLs).
    - Optimistic session rows for in-flight creates; holdings/API lists must work when `deployed_to` is missing (Mongo people/classes) and 404 only when the issuer id is unknown.

### Data Flow

**Transaction Creation (direct wallet — `/app` manage UI)**:

1. Frontend generates a bytes16 id where required and submits from the connected admin wallet via wagmi (`useDirect*` + `useOnchainAction`: submit → wait receipt → success/reverted). Scaling/IDs/share-cap checks use `@tap/units`. The chain assigns issuance + security ids internally for `issueStock` and transfer balance securities; the frontend supplies ids for `createStakeholder` and `createStockClass`.
2. For **class and stakeholder**, the frontend POSTs OCF metadata to `/register-onchain` only after the receipt confirms. The server validates and persists metadata with `is_onchain_synced` / `tx_hash`; it does not submit onchain again.
3. For **issuance**, the frontend first calls `/transactions/issuance/stock/register-onchain` to validate OCF metadata and share caps, then submits the wallet tx. That endpoint does not persist the issuance; the poller writes it from the event.
4. For **transfer**, the wallet calls `CapTable.transferStock` only; poller `handleStockTransfer` writes Mongo + historical TX (same as API-path transfers).
5. The poller is still authoritative — it picks up events and writes canonical records (joining on bytes16 id where applicable). UI “Refresh” runs reconcile + reloads holdings/history; do not jump the poller to head on every refresh (that skipped events and created ghost classes).

**Transaction Creation (server-signed API / docs)**:

1. API receives OCF-formatted request at `/<entity>/create` (or `/transactions/transfer/stock`, etc.)
2. Validates against OCF schema, converts, submits with the local developer `PRIVATE_KEY` if set. That key is not OPERATOR_ROLE and is not required for the wallet-first path.
3. Poller mirrors events to MongoDB

**Minting**:
Product mint is the connected ADMIN wallet calling `createCapTable` (deployer of that instance), then `POST /issuer/register`. API mint is `POST /issuer/create`. The deployer is ADMIN; `NEXT_PUBLIC_OPERATOR_ADDRESS` is an optional extra address granted `OPERATOR_ROLE` at mint — not a key.

## Development Commands

### Setup

**Golden path (Plume, agents and humans):**

```bash
pnpm install
# Mongo + API + poller; registers the shared demo factory in Mongo. SKIP_APP=1 keeps :3000 free.
REUSE_TAP_FACTORY=1 SKIP_APP=1 pnpm bootstrap
# app/.env.local: NEXT_PUBLIC_* (factory, chain, api url). NEXT_PUBLIC_OPERATOR_ADDRESS is optional
# (empty = no extra operator). PRIVATE_KEY optional for wallet UI
pnpm app:dev                         # product UI — do not rely on Docker app alone
```

`pnpm bootstrap` is idempotent. Without `SKIP_APP=1` it also builds the Docker `next start` preview on :3000; run `docker compose stop app` before `pnpm app:dev`. `pnpm docker:mongo` starts Mongo alone (host **27027**, not 27017). Factory model + failure matrix: [`AGENTS.md`](./AGENTS.md).

Manual steps (if not using bootstrap):

```bash
pnpm install
pnpm setup
cp .env.example .env
# also create app/.env.local with the same NEXT_PUBLIC_* values
pnpm docker:mongo   # host 27027; or SKIP_APP=1 pnpm bootstrap for API too
pnpm app:dev
```

### Running the Application

```bash
# Development server (with event poller)
pnpm dev

# Production server without poller
pnpm prod

# Production server with finalized-only poller
pnpm prod-poller
```

**Entry Points**:

- `server/server.js`: Express server with optional poller
- `server/entry.ts`: Standalone event poller

**Options**:

- `--finalized-only`: Only process finalized blocks (safer for production)
- `--no-poller`: Disable event poller (useful when running poller separately)

### Testing

```bash
# Solidity tests (Foundry)
pnpm test
# Or: cd chain && forge test
# Or: make test

# Run specific test
cd chain && forge test --match-test testAdjustIssuerAuthorizedShares

# Invariant tests (stateful fuzzing)
make test-invariant           # Standard run (256 runs, 50 depth)
make test-invariant-deep      # Deep run (2000 runs, 100 depth)
```

**Test Files**:

- Solidity: `chain/test/*.t.sol` (Foundry tests)
- Invariant tests: `chain/test/invariants/*.sol`

### Linting and Formatting

```bash
# Shared units package (@tap/units)
pnpm test:units

# Lint TypeScript/JavaScript
pnpm lint

# Format all files
pnpm format

# Type check
pnpm typecheck
```

CI (`.github/workflows/ci.yml`) also runs `pnpm --filter tap-docs lint`, `pnpm --filter tap-app lint`, and `pnpm --filter tap-app typecheck`; root `pnpm lint` ignores `docs/`. `security.yml` runs the invariant suite when Solidity or `foundry.toml` changes. CI doesn't typecheck the server, build the app or docs, or run e2e; run those locally. `pnpm --filter tap-app test:nav` is a local-only check and never goes in CI.

### Invariant Testing

Foundry's coverage-guided invariant testing validates protocol-wide properties:

- **Tests**: `chain/test/invariants/CapTableInvariants.t.sol`
- **Handler**: `chain/test/invariants/CapTableHandler.sol` — bounded actions for create, issue, seed, transfer (including self-transfer), repurchase, cancel, retract, reissue, and authorized-share adjusts. It tracks live lots from issuance txs; seed lots are recorded from the ids passed to `mintActivePositions` (seed writes no `transactions` entries).
- **Config**: `chain/foundry.toml` `[invariant]` section (`fail_on_revert = false`; handler early-returns or `try/catch` so the campaign is not drowned in setup reverts)

The nine invariants (`docs/src/content/tests.mdx#invariants` lists them by name):
- `shares_issued <= shares_authorized` for the issuer and every stock class
- Stock class authorized shares never exceed issuer authorized
- Issuer `shares_issued` equals the sum of every class's `shares_issued`
- Live holdings per class equal that class's `shares_issued`
- Stakeholder and stock class index mappings point back to their records
- Stakeholder and stock class counts match the handler's

Do not reintroduce unused `ghost_*` counters on the handler. Assert against onchain state.

The handler bounds its inputs to the share caps, so the two cap invariants hold because of the handler as well as the contract. The contract doesn't check class authorized ≤ issuer authorized at `createStockClass`, class authorized ≥ issued on a class adjust, issuer authorized ≥ every class's authorized on an issuer adjust, or that `removeWalletFromStakeholder` gets the wallet's own stakeholder. Each needs a beacon upgrade; they're documented on `docs/src/content/security.mdx` and left unchanged pending a decision. The app allows class > issuer at create on purpose (`validateShareCaps` only warns).

### Documentation

```bash
# Run docs dev server (http://localhost:3001)
pnpm docs:dev

# Build docs for production
pnpm docs:build

# Serve production build
pnpm docs:start
```

The docs are a Nextra 4 App Router site in the `docs/` workspace (`tap-docs`). Pages are MDX under `docs/src/content`, and each file's path is its URL; every folder's `_meta.js` sets sidebar order and titles. Sections: `/development`, `/api-reference`, `/protocol`, `/api-guides`, `/security`, `/tests`. `/api-guides` replaced `/features` in Sep 2026 (six pages were renamed with it); `docs/next.config.mjs` redirects every old URL permanently. Vercel deploys docs on each push to `main` and builds no previews, so check the production build locally. See `docs/README.md`.

### Documentation DX conventions

When editing pages under `docs/src/content/`, follow these conventions. They come from the Sep 2026 readability and accuracy rewrite (`memory/sep-28-2026.md`):

- **Human-written pages**: `index.mdx`, `development.mdx`, `development/factory-deploy.mdx`, and `development/cap-table-deploy.mdx` keep Alex's wording. Cut AI-added text and fix facts; don't rewrite the voice.
- **Intro paragraphs**: Use plain language. Avoid unexplained implementation terms (e.g. "beacon proxy pattern") unless the page is specifically about that concept.
- **No slop**: no roadmap or changelog asides ("today", "currently", "yet"), no "Use this page when…" meta-text, no emphasis bold outside real warnings, no em-dash chains or sentence fragments, and no internal trivia (log emoji, controller filenames, `issuanceOrdinal`).
- **One home per concept**; every other page gets one sentence and a link. Scaling, server-signed routes, request conventions, and Known issues live in `api-reference.mdx`; onchain roles in `protocol/tap-cap-table.mdx#roles`; keys in `development/setup.mdx#three-wallets-keys`; demo addresses in `development/factory-deploy.mdx`; history shape and timing in `development/historical-transactions.mdx`; invariants in `tests.mdx`; the stock plan example in `api-guides/corporate-actions/valuations-and-terms.mdx`.
- **Poller coverage stays minimal** (an indexer replaces it): history arrives after the poller's next pass (about 20 s, or about 20 min behind with `prod-poller`), how to run it, and the one "history never updates" fix. No mode tables, tuning knobs, or `fast-forward` walkthroughs in public docs.
- **Internal steps stay short**: the app's issuance check runs in under a second, so it gets one clause ("the app checks the request, then your wallet calls `issueStock`"), not its internals.
- **Scaling callout**: Pages that send or show quantities or prices get a one-line `<Callout type="warning">` right after the response overview, never only at the bottom: send human values; the contract stores quantities and prices ×**1e10**; the server scales on write, and the poller and `/cap-table/holdings/stock` scale back. Link to `/api-reference#scaling`, the one place with the full rules. Docs that still say ×10000 are wrong.
- **Slugs match titles**: When a page title changes, rename the file with `git mv`, update its `_meta.js` key and every link, and add a permanent redirect for the old URL in `docs/next.config.mjs`. `_meta.js` titles match the page H1.
- **Examples**: Write requests as runnable `curl` commands against `"$API/..."` with heredoc JSON bodies (`-d @- <<JSON`). GET routes that need an `issuerId` body use `-X GET`, because `curl -d` alone sends POST. Every body must pass the server's OCF validation. Use `$API`, `$ISSUER_ID`, `$STOCK_CLASS_ID`, and `$STAKEHOLDER_ID` (exported on the Development pages) and reserved example data (`example.com`, EIN `00-0000000`, a 555 phone number), never real-looking personal data.
- **Page structure**: Development step pages use `## In the app` then `## With the API`. Task pages end with `NextActions`; reference pages end with a one-line "Related".
- **Known issues**: `api-reference.mdx` → Known issues lists what the current code still gets wrong. Code bugs found while writing docs go to a separate fix PR; stack the docs PR on it so the docs describe the fixed behavior, and keep Known issues for what the fix PR doesn't cover.
- **Dependency lists**: Each tool in an install/setup page should have a one-line purpose annotation so readers understand why it is required.
- **Setup ordering**: `pnpm install` should appear on the install page directly after `git clone`, not deferred to a later setup page.
- **ID format explanations**: When referencing internal ID formats (e.g. bytes16/UUID-without-dashes), explain the exact format and the consequence of omitting or mismatching it.
- **Factory deploy page**: Prefer `pnpm deploy-factory` (auto-register) and `pnpm factory:register` over hand-editing Mongo. Compass remains optional for inspection. Document TA-owned factory vs shared demo clearly; never hardcode a stale implementation address.
- **Diagrams**: Prefer Mermaid fenced blocks (```` ```mermaid ````) over JPG/PNG diagrams for new content. Mermaid renders inline in Nextra, respects light/dark theme, and stays editable in MDX. Existing screenshots stay — do not delete them.
- **Before merging docs**: validate every `curl` body with `server/utils/validateInputAgainstSchema.js`, built the way its route builds it (placeholder `id`, `date`, and `object_type`; `stakeholderId` and `stockClassId` stripped). Check internal links, anchors, and `_meta.js` keys. Run `pnpm --filter tap-docs lint`, then `pnpm docs:build && pnpm docs:start` and request the old URLs to confirm the redirects. Keep validation scripts out of the repo and CI; record what passed in the memory note.

### Frontend App

```bash
# Run frontend dev server
pnpm app:dev

# Build frontend for production
pnpm app:build

# Serve production build
pnpm app:start

# Playwright e2e (desktop + iPad + iPhone, mocked API)
pnpm app:test:e2e
```

The frontend is a Next.js 16 app in the `app/` workspace. Marketing is `/`; product is `/app/*`. Legacy `/mint` and `/manage*` redirect to `/app`. Design system, write path, and routes: [`app/WARP.md`](app/WARP.md). Generated contract hooks live in `app/src/generated.ts` — regenerate with `pnpm --filter tap-app generate:wagmi` after ABI changes.

### Deployment

```bash
# Deploy factory contract
pnpm deploy-factory
# Or with custom env file: ./scripts/deployFactory.sh .env.prod
# Add source verification: ./scripts/deployFactory.sh .env.prod --verify

# The script:
# 1. Parses KEY=VALUE environment variables without executing the env file
# 2. Runs forge script (chain/script/DeployFactory.s.sol) with the deploy profile
# 3. CREATE2-deploys libraries, CapTable, and CapTableFactory; the beacon is CREATE2 from the factory
# Upgrade an existing beacon in place (no second factory):
#   ./scripts/deployFactory.sh --upgrade-factory 0xYourFactory
```

`--verify` submits to Sourcify. Plume Blockscout currently does not offer Solidity 0.8.37, so direct Blockscout compilation fails even when the deployed bytecode is correct. Open each contract address on `explorer.plume.org` after Sourcify succeeds; Blockscout imports the match automatically. `is_partially_verified: true` is expected because `bytecode_hash = "none"` and `cbor_metadata = false` omit the metadata fingerprint required for a full match.

## Project Structure

```
tap-cap-table/
├── app/                # Frontend (Next.js, workspace: tap-app)
│   ├── src/
│   │   ├── pages/      # `/` landing; `/app/*` product; legacy redirects
│   │   ├── components/ # shell + forms; cap-table/* for company workspace
│   │   ├── hooks/      # useDirect*, useMintIssuer, useCapTableManager
│   │   └── lib/copy.ts # product copy (human labels)
│   └── package.json
├── chain/              # Foundry project (Solidity). Deploy: scripts/deployFactory.sh
│   ├── src/            # Smart contracts
│   ├── script/         # DeployFactory.s.sol (CREATE2 deploy + beacon upgrade)
│   ├── broadcast/      # Committed forge records of live Plume deploys
│   ├── test/           # Solidity tests
│   └── foundry.toml    # Foundry config (deploy profile holds the library CREATE2 salt)
├── server/             # API server (Express + Node.js)
│   ├── app.js          # Express app setup
│   ├── server.js       # Main entry point (server + poller)
│   ├── entry.ts        # Standalone poller entry point
│   ├── chain-operations/  # Blockchain interaction
│   │   ├── transactionPoller.ts      # Event polling
│   │   ├── transactionHandlers.js    # Event handlers
│   │   ├── deployCapTable.js         # Deploy contracts
│   │   └── structs.js                # Solidity struct definitions
│   ├── controllers/    # Business logic for entities
│   ├── db/
│   │   ├── objects/    # Mongoose models
│   │   ├── operations/ # CRUD operations
│   ├── routes/         # Express routes
│   ├── scripts/        # factory:register, poller:fast-forward
│   └── utils/          # Utilities (UUID, OCF validation, etc.)
├── docs/               # Developer documentation (Nextra 4 App Router, workspace: tap-docs)
│   ├── src/content/    # MDX pages (path = URL) + _meta.js per folder
│   ├── src/app/        # App Router shell
│   ├── next.config.mjs # Permanent redirects for renamed pages (/features → /api-guides)
│   └── public/         # Static assets (icons/; _pagefind/ is build output, gitignored)
├── ocf/                # https://github.com/transfer-agent-protocol/tap-ocf (schemas only; pin 6d8c9322)
├── packages/units/     # @tap/units — shared scale / UUID / share-caps
├── scripts/            # bootstrap-plume, deployFactory, setup, dev
├── docker/             # Dockerfile.server (API) + Dockerfile.app (next start preview)
├── .env.example        # Environment template
├── docker-compose.yml  # Docker services (MongoDB, server, app)
├── pnpm-workspace.yaml # Workspace config
└── package.json        # Root scripts and server dependencies
```

## Important Patterns

### UUID ↔ bytes16 Conversion

UUIDs (128-bit) are stored as `bytes16` in Solidity. Use:

- `convertUUIDToBytes16()` before sending to contract
- `convertBytes16ToUUID()` after reading from contract

### Fixed-Point Decimals

Share quantities and prices use scaled BigNumbers (1e10 precision):

- `toScaledBigNumber(value)` to convert before contract calls
- Always scale quantities and prices in transaction parameters
- The poller unscales by 1e10 on read (`toDecimal()` in `transactionHandlers.js`). Any new direct-wallet path must scale on the write side via `@tap/units` (`scaleShares` / `scaleAmount`).

### OCF Validation

Validate all input against OCF schemas. Routes import the schema JSON and pass that object. The default export is `validateInputAgainstOCF`.

```javascript
import stakeholderSchema from "../../ocf/schema/objects/Stakeholder.schema.json" with { type: "json" };
import validateInputAgainstOCF from "./utils/validateInputAgainstSchema.js";
await validateInputAgainstOCF(data, stakeholderSchema);
```

### Atomic Database Operations

When `DATABASE_REPLSET=1`, use `withGlobalTransaction()` for atomic operations:

```javascript
import { withGlobalTransaction } from "./db/operations/atomic.ts";
await withGlobalTransaction(async () => {
    // Your database operations here
});
```

### Contract Middleware

API routes requiring contract access use `contractMiddleware`:

- Requires `issuerId` in request body
- Attaches `req.contract` and `req.provider`
- Example: `/stakeholder`, `/stock-class`, `/transactions`

### Environment Configuration

The system supports multiple environments via `.env` files:

- `.env`: Default server, Docker Compose, and CLI configuration
- `app/.env.local`: Host Next.js configuration (`NEXT_PUBLIC_*`)
- Custom files such as `.env.prod`: pass the path to `scripts/deployFactory.sh`, or set `USE_ENV_FILE` for server scripts that call `setupEnv()`

**Key Variables**:

- `DATABASE_URL`: MongoDB connection string (host TAP Mongo is **27027**; compose-internal stays `mongodb:27017`)
- `MONGO_PORT`: optional host publish port (default 27027)
- `DATABASE_REPLSET`: Set to "1" for replica set (enables transactions)
- `RPC_URL`: Ethereum RPC endpoint
- `CHAIN_ID`: Network chain ID (31337 for Anvil, 98866 for Plume Mainnet, 98867 for Plume Testnet)
- `PRIVATE_KEY`: **Dev/demo only**, optional for wallet-first UI. Server-signed API + CLI `deploy-factory` when set; placeholder → poller read-only. Never factory-owner or prod keys in long-running env (see Three keys above)
- `PORT`: API server port (default 8293)
- `NEXT_PUBLIC_FACTORY_ADDRESS`: Deployed CapTableFactory contract address
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID the frontend targets
- `NEXT_PUBLIC_API_URL`: API server URL (default `http://localhost:8293`)
- `NEXT_PUBLIC_OPERATOR_ADDRESS`: Address (not a key) granted OPERATOR_ROLE on new cap tables. Optional. An empty value or `UPDATE_ME` mints without an extra operator. Any other non-address stops the mint (`app/src/config/contracts.ts`).
- `POLLER_MAX_CONCURRENCY`: Number of issuers processed in parallel per polling cycle (code default 5; `.env.example` and `docker-compose.yml` use 8). The only tuning knob the poller exposes; will be removed when the indexer replaces it.

## Working with OCF

The `ocf/` directory is a **git submodule** of [transfer-agent-protocol/tap-ocf](https://github.com/transfer-agent-protocol/tap-ocf), not a pnpm workspace. TAP imports JSON schemas as files. The pin is `6d8c9322`. Do not `git pull origin main` in `ocf/` until the validator can compile OCF version dispatchers (see the tap-ocf bump issue).

```bash
git submodule update --init --recursive
```

OCF defines the standard for:

- Issuers, Stakeholders, StockClasses
- Transactions (issuances, transfers, cancellations, etc.)
- VestingTerms, StockPlans, StockLegends
- File manifests (`Manifest.ocf.json`)

## Git Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md). Branch from `main`; never commit to `main`; Conventional Commits on PR titles.

**memory + commit rule:** end every task by adding or updating a dated note in `memory/` (`memory/<mon>-<d>-<yyyy>.md`, e.g. `memory/sep-27-2026.md`) and linking it from the previous note's last line. then commit the work and the note on the feature branch in atomic groups. keep notes, commit messages, and pr text short and lowercase (code, paths, and addresses keep their case).

## Database

Uses MongoDB with optional replica set for transactions:

- **Single-node**: `DATABASE_REPLSET=0` (no transaction support)
- **Replica set**: `DATABASE_REPLSET=1` (enables multi-document transactions)

The Docker Compose file creates a single-node setup. For replica sets, use MongoDB's `--replSet` option.

**Models**: OCF object types used by the poller and product UI have Mongoose models in `server/db/objects/`. `Issuer.is_manifest_created` remains on the schema (default `false`). There is no zip or manifest import route.

## TypeScript Configuration

The project uses TypeScript with:

- `target: ESNext`, `module: ESNext`
- `allowJs: true` (mixed TS/JS codebase)
- `strict: false` (legacy code)
- `isolatedModules: true` (for tsx)
- `allowImportingTsExtensions: true`

Use `tsx` for running TypeScript files directly (already configured in scripts).

## VS Code Configuration

The repository includes `.vscode/extensions.json` with recommended extensions for development.

If you encounter "Source file requires different compiler version" errors in VS Code, ensure your Solidity extension is configured to use compiler version 0.8.37 (matching `chain/foundry.toml`):
1. Reload VS Code (Cmd+Shift+P → "Developer: Reload Window")
2. The extension will download the correct compiler version automatically

## Foundry (Solidity)

- **Compiler**: Solidity **0.8.37** (`chain/foundry.toml` `solc_version`; exact `pragma solidity 0.8.37` on CapTable / factory / interfaces)
- **Foundry**: forge/cast/anvil **v1.8.3**. CI installs `v1.8.3`. `pnpm setup` runs `foundryup --install v1.8.3`. Do not `foundryup` to nightly for this repo.
- **Config**: `chain/foundry.toml`
- **Optimizer**: Enabled, 200 runs, via-ir
- **EVM**: `osaka`. Plume mainnet and testnet list Fusaka as the latest supported EVM (ArbOS 51, activated 5 February 2026). Do not set `amsterdam`; that target is for Glamsterdam and is not live on Plume.
- **Verification**: use `--verifier sourcify` while Plume Blockscout lacks Solidity 0.8.37, then visit the explorer address to trigger its Sourcify import. A partial match is expected with metadata disabled; do not downgrade the compiler just to satisfy Blockscout.
- **Tests**: Use `forge test` with optional filters: `--match-test`, `--match-contract`
- **Comments**: NatSpec lives on interfaces (`@notice` / `@dev` gotchas). Implementations use `@inheritdoc`. Spell **onchain** / **offchain** (no hyphen). No TODO/placeholder/MVP comments in `chain/src`. Explain why, not what.

Libraries:

- OpenZeppelin v5.4.0: `openzeppelin-contracts` (factory, beacon, proxy) and `openzeppelin-contracts-upgradeable` (CapTable)
- forge-std v1.16.2
- Access control: `AccessControlDefaultAdminRulesUpgradeable`

**Compiler upgrades (do not mix with feature PRs):** the pin is Solidity **0.8.37** and Foundry **v1.8.3**. A via-ir compiler bump changes bytecode even if TAP source is identical, so it also moves CREATE2 addresses. Sequence for the next bump: separate PR for pragma/`foundry.toml`/docs → `forge clean && forge build --via-ir` → storage-layout diff (must be identical) → deploy new CapTable implementation → factory `updateCapTableImplementation` (one beacon, every company) → re-verify on Plume (Sourcify if Plume Blockscout's compiler list lacks the new solc) → update the landing demo table in `app/src/pages/index.tsx`. Keep the CI Foundry pin on the same release as `pnpm setup`. ABI-only? regenerate wagmi; compiler-only usually does not change ABI.

## Common Pitfalls

1. **Forgetting to scale numbers**: Always use `toScaledBigNumber()` for quantities and prices. Direct-wallet hooks must scale on the write side or the poller's 1e10 unscale will produce tiny fractions in Mongo (e.g. `69000` raw → `0.0000069` after unscale).
2. **UUID format mismatch**: Convert UUIDs to bytes16 before contract calls.
3. **Poller not running**: Transactions won't sync to DB without the event poller.
4. **Missing replica set**: Atomic operations fail without `DATABASE_REPLSET=1`.
5. **OCF validation skipped**: Always validate input against schemas.
6. **Contract events not emitted**: Check that contract functions emit expected events.
7. **Mixing `/create` and `/register-onchain` semantics**: `/create` makes the server submit onchain. Class/stakeholder `/register-onchain` assumes a confirmed wallet receipt; issuance `/register-onchain` is a validation-only preflight before the wallet tx. Don't reintroduce a `suppliedId`-style overload on the `/create` route — that pattern was explicitly removed.
8. **Optimistic-state dedupe by stakeholder+stockclass**: Don't. Multiple issuances can exist for the same pair; deduping there hides legitimate in-flight rows. Session rows live in the company dashboard until it unmounts. A second stock class or shareholder submit is ignored while that write is waiting for a receipt.
9. **MongoDB "Connection ended" log lines are not an error**: they're normal idle connection-pool churn (`connectionCount` ticks down as pooled sockets close). A real failure logs "Error connecting to Mongo". The poller printing `Processing for <issuer>: <block>` with an advancing block number means it is healthy.
10. **Factory config has two independent sources — don't conflate them**: the server reads the factory from the Mongo `factories` collection (`deployCapTable` uses `factories[0].factory_address`); the frontend reads `NEXT_PUBLIC_FACTORY_ADDRESS` from `app/.env.local`. The Docker app service gets `NEXT_PUBLIC_*` from compose env (root `.env`). `pnpm app:dev` reads only `app/.env.local` — keep both files aligned. A new factory address is CREATE2 (salt + bytecode + owner via the Arachnid deployer), not deployer nonce. The shared Plume demo factory is the older CREATE deployment; do not replace its beacon or upsert a second factory over it. The implementation is an **upgradeable** beacon target, so **never hardcode them**: `pnpm deploy-factory` auto-registers both from the real deploy, and `pnpm factory:register --factory <addr>` reads the current implementation from the factory onchain (`upsertFactory` keeps a single record — one operator factory, many cap tables). Keep the Mongo factory and `app/.env.local` on the same address. A factory's **owner** (the wallet that deployed it) controls beacon upgrades for all its cap tables. On the shared Plume demo factory that is `0x366a…` (deploy key), not TAP Admin `0x3601…`. Only reuse a factory whose owner wallet you control.
11. **Docker Next rewrites vs browser**: `NEXT_PUBLIC_API_URL` drives Next **server-side** `/api/*` rewrites. In the Docker app container use `http://server:8293`. Host `pnpm app:dev` uses `http://localhost:8293` in `app/.env.local`. Wrong value → mint onchain succeeds but register shows Internal Server Error.
12. **Issuing a stakeholder's first stock**: the Issue Stock dropdown needs the issuer's stakeholders, so `GET /cap-table/holdings/stock` returns `stakeholders` (and `stockClasses`) — the manage UI can populate the dropdown before any issuance exists. Don't source the stakeholder list only from `holdings[]`; it's empty until stock is issued, which would make a fresh cap table unable to issue its first shares after a page reload.
13. **Nav issuer id**: company section links must use the real UUID from `router.query.issuerId` (or path), never a pattern string from `pathname` — otherwise users land on `/app/companies/%5BissuerId%5D`.
14. **Ghost stock classes**: registering metadata with `is_onchain_synced: false` after a failed wallet path, or jumping the poller past unprocessed events, leaves classes in Mongo that never landed onchain. Prefer receipt-gated `/register-onchain` (synced + tx_hash) and reconcile over head-jumps for routine refresh.
15. **Transfer already exists onchain/server**: UI transfer is a thin direct-wallet wrapper around `CapTable.transferStock` / TransferStock poller handling — do not invent a parallel transfer protocol or reimplement scaling outside `@tap/units`.
16. **TAP Mongo on 27017 / comes back after Docker Desktop restart**: compose used to publish 27017 with `restart: always`. Host port is **27027**, policy is `unless-stopped`. Update host `DATABASE_URL`. `docker compose stop` frees the port and leaves the containers in place. `pnpm docker:down` removes them; do not use it to recover the stack.
17. **Records from servers before the Oct 2026 audit fixes**: `create.js` used to save a random `_id`, so stakeholders and classes created through `/stakeholder/create` or `/stock-class/create` by older servers stay `is_onchain_synced: false` and revert in later server-signed writes (`NoStakeholder` / `InvalidStockClass`); register them again under their onchain ids. Adjustment history rows from older servers hold raw ×1e10 values until a poller reindex. Mongo `initial_shares_authorized` is never updated by adjustments; read caps from the contract. What the code still gets wrong is listed in `docs/src/content/api-reference.mdx` → Known issues.

## Debugging

- **Logs**: Server console (listen, poller block numbers, event processing)
- **Database**: Connect to MongoDB on host port **27027** (credentials in `.env`)
- **Blockchain**: Use RPC_URL to query contract state with ethers.js or cast
- **Event poller**: Runs in-process by default; check console for event processing logs
- **Poller block number stalled or far behind head**: fast-forward the per-issuer index with `pnpm poller:fast-forward` (`--issuer <id>`, `--block <n>`, `--dry-run`, `--help`). It sets `last_processed_block` to (near) chain head so the poller stops chasing a backlog and just tracks new blocks — handy on fast chains (Plume) or after the server was offline. Skips events between the old pointer and head, which is fine for a cap table with no real positions yet.
- **"Connection ended" Mongo logs**: benign idle connection-pool churn, not a connectivity problem (see Common Pitfalls).

## Additional Resources

- Official docs: https://docs.transferagentprotocol.xyz
- OCF standard: https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF
- Foundry book: https://book.getfoundry.sh/
