# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Transfer Agent Protocol (TAP) Cap Table is an onchain cap table implementation that combines Solidity smart contracts with an off-chain Node.js API server. It implements the [Open Cap Table Coalition (OCF)](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard for representing cap table data.

This is a **pnpm monorepo** with the following workspaces:
- `app/` - Next.js frontend (tap-app)
- `docs/` - Nextra documentation site (tap-docs)
- `ocf/` - OCF standard git submodule
- `packages/units` (`@tap/units`) - shared 1e10 scaling, UUID↔bytes16, share-cap validation (app + server)

### Licensing

The monorepo (chain, server, app, docs, packages) is **BUSL-1.1** (PALMER.EARTH CORP). Change Date January 1, 2028 → AGPL-3.0+. See root `LICENSE`. Submodules and third-party deps keep their own licenses.


## Architecture

### Hybrid onchain/Off-chain Design

The system maintains a **dual-state architecture**:

- **Onchain (Ethereum/L2)**: Smart contracts (CapTable.sol, CapTableFactory.sol) store authoritative transaction data and active positions
- **Off-chain (MongoDB + Node.js)**: Express API server stores OCF-compliant objects and metadata, processes blockchain events

**Critical**: The blockchain is the source of truth for transactions. The off-chain database mirrors this state by listening to contract events via the transaction poller.

### Ownership & Role Architecture

The protocol uses a three-tier access model:

- **ADMIN_ROLE** (asset manager's wallet): Grants/revokes roles, manages cap table governance. When created via the factory, `msg.sender` receives ADMIN. Admins are implicitly operators (`_checkOperatorRole` checks both roles).
- **OPERATOR_ROLE** (Transfer Agent Protocol server): Issues stock, transfers it, cancels it, re-issues it, manages shareholders, creates stock classes and stakeholders. All day-to-day cap table operations. Granted during cap table creation if an operator address is provided.
- **Factory owner** (wallet that deployed that factory): Controls the `UpgradeableBeacon`, can upgrade the `CapTable` implementation for ALL proxies of **that** factory via `updateCapTableImplementation()`. Has no access to individual cap tables as admin. On the shared Plume demo factory this is the protocol builder (TAP Admin); a licensed transfer agent should deploy their own factory so they own upgrades.

**Three keys (do not conflate):** (1) **Factory owner** — cold/infrequent CLI for deploy + beacon upgrades; never the long-running Docker `PRIVATE_KEY`. (2) **Issuer ADMIN** — browser wallet in `/app` that called `createCapTable`. (3) **Server/operator** — optional root `.env` `PRIVATE_KEY` for server-signed API / `deploy-factory`; `NEXT_PUBLIC_OPERATOR_ADDRESS` is only the **address** granted at mint (no key required on server for wallet-first path). Local `PRIVATE_KEY` is **dev/demo only** (placeholder OK; poller read-only). Full write-up: `docs/src/pages/development/setup.mdx` → “Three wallets / keys” (`#three-wallets-keys`).

**Cap table creation** is permissionless — anyone can call `createCapTable()` on the factory. The caller becomes the ADMIN of the new cap table and can optionally designate an OPERATOR address (typically the TAP server) at creation time.

**Access control split:**
- `onlyOperator` (server + admins): `createStockClass`, `createStakeholder`, `createStockLegendTemplate`, `issueStock`, `transferStock`, `repurchaseStock`, `retractStockIssuance`, `reissueStock`, `cancelStock`, `addWalletToStakeholder`, `removeWalletFromStakeholder`, `mintActivePositions`, `mintSharesAuthorized`, `adjustIssuerAuthorizedShares`
- `onlyAdmin` (asset manager only): `addAdmin`, `removeAdmin`, `addOperator`, `removeOperator`

The factory uses OpenZeppelin's `UpgradeableBeacon` — each cap table is a `BeaconProxy`. The factory owner can upgrade all cap tables at once via `updateCapTableImplementation()`.

### Key Components

**Terminology Note**: Throughout this codebase, "stakeholder" follows OCF standard terminology and specifically refers to equity holders on the cap table (those who own shares). This includes individuals (founders, employees, advisors) and institutions (VCs, investors) with equity positions.

1. **Solidity Contracts** (`chain/src/`):
    - `CapTable.sol`: Core contract managing stakeholders, stock classes, transactions, and active positions
    - `CapTableFactory.sol`: Deploys new CapTable instances for issuers
    - Supports: stock issuance, transfers, cancellations, repurchases, reissuances, adjustments

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
      - `POST /<entity>/register-onchain` — **manage UI path**: caller's wallet already submitted onchain; endpoint validates (+ share-cap checks for issuance), sets `is_onchain_synced` / `tx_hash`, and persists metadata. Poller remains authoritative.
      - `POST /<entity>/create` — server-signed legacy/API path (server OPERATOR key submits onchain). Still used by manifest seed tooling; **not** used by the `/app` manage UI.
    - Issuer helpers for the product UI:
      - `GET /issuer/by-deployer/:address` — list issuers a given admin wallet deployed (`Issuer.deployed_by`).
      - `GET /issuer/full/:id` — full Issuer document (read-only).
      - `POST /issuer/summaries` — readiness stats for company cards (people/classes/issuances/ghost flags).
      - `POST /issuer/reconcile` — flip sync flags against chain + backfill missing `tx_hash` values from logs.
      - `POST /issuer/poller-catchup` — reindex (rebuild cursor from deploy) vs head (fast-forward). Prefer reconcile for UI “Refresh”; reindex only when the mirror is empty/corrupt.
    - Stock transfer: `POST /transactions/transfer/stock` is the **server-signed** API/docs path (`transferController` → `contract.transferStock`). The manage UI does **not** call this; it uses direct-wallet `useDirectTransferStock` (same `StockTransferParams` / scaling). Poller `handleStockTransfer` mirrors either path into Mongo `StockTransfer` + historical rows.

4. **State Machines** (`server/state-machines/`):
    - XState machines used by **OCF manifest preprocess/seed** (not the live poller path) to compute active positions before minting
    - Live day-to-day manage UI does not depend on these machines

5. **Database Layer** (`server/db/`):
    - Mongoose models for OCF objects (Issuer, Stakeholder, StockClass, VestingTerms, StockTransfer, etc.)
    - Atomic operations with MongoDB transactions when `DATABASE_REPLSET=1`

6. **OCF Submodule** (`ocf/`):
    - Git submodule containing the Open Cap Format standard
    - JSON schemas used for validation
    - Sample OCF files in `ocf/samples/`

7. **Frontend Cap Table Management UI** (`app/src/pages/app/`, `app/src/components/cap-table/`):
    - **Marketing** `/` — landing only (docs, GitHub, demo contracts). No wallet chrome, no product CTAs.
    - **Product** under `/app/*` (wallet + left nav shell):
      - `/app` / `/app/companies` — company list (localStorage + `/issuer/by-deployer` + Load from wallet; summaries for readiness chips).
      - `/app/mint` — deploy a new cap table from the connected admin wallet.
      - `/app/companies/[issuerId]?view=…` — full company workspace. Sections (left nav, setup order): **Holdings** → **Stock classes** → **Shareholders** → **Issue stock** → **Transfer** → **Transactions**.
    - Legacy `/mint` and `/manage*` redirect into `/app/*`.
    - Direct-wallet writes: stock class, shareholder, issuance, **stock transfer** (`useDirect*` + `useOnchainAction`). Class/person/issuance metadata via `/register-onchain` after receipt; transfers rely on the poller (`StockTransfer` / historical TX) — no separate transfer register endpoint.
    - UI lives in `components/cap-table/*` (dashboard orchestrator, views, ownership bar, `DataTable` lists). Product copy in `lib/copy.ts`. Nav config in `navConfig.ts` — always use `query.issuerId` / `asPath` for links, never `router.pathname` with a `[issuerId]` pattern (that produced `%5BissuerId%5D` URLs).
    - Optimistic session rows for in-flight creates; holdings/API lists must work when `deployed_to` is missing (Mongo people/classes) and 404 only when the issuer id is unknown.

### Data Flow

**Transaction Creation (direct wallet — `/app` manage UI)**:

1. Frontend generates a bytes16 id (where required) and submits the tx from the connected admin wallet via wagmi (`useDirect*` + `useOnchainAction`: submit → wait receipt → success/reverted). Scaling/IDs/share-caps use `@tap/units`. The chain assigns issuance + security ids internally for `issueStock` and transfer balance securities; the frontend supplies its own ids for `createStakeholder` and `createStockClass`.
2. For class / stakeholder / issuance: frontend POSTs OCF metadata to `/<entity>/register-onchain` after confirmation. Server validates (and asserts share caps on issuance) and persists offchain metadata; **does not** submit onchain again.
3. For **transfer**: wallet calls `CapTable.transferStock` only; poller `handleStockTransfer` writes Mongo + historical TX (same as API-path transfers).
4. The poller is still authoritative — it picks up events and writes canonical records (joining on bytes16 id where applicable). UI “Refresh” runs reconcile + reloads holdings/history; do not jump the poller to head on every refresh (that skipped events and created ghost classes).

**Transaction Creation (server-signed, legacy / API / manifest seed)**:

1. API receives OCF-formatted request at `/<entity>/create` (or `/transactions/transfer/stock`, etc.)
2. Validates against OCF schema, converts, submits via the server's OPERATOR key
3. Poller mirrors events to MongoDB

**Minting**:
When a manifest is created, the system:

1. Creates stakeholders and stock classes onchain
2. Mints `shares_authorized` and `shares_issued` for issuer and stock classes
3. Mints active positions and security IDs from preprocessor cache

## Development Commands

### Setup

**Golden path (Plume, agents and humans):**

```bash
pnpm install
REUSE_TAP_FACTORY=1 pnpm bootstrap   # Mongo + API (+ app image), demo factory in Mongo
# app/.env.local: NEXT_PUBLIC_* (factory, chain, operator address). PRIVATE_KEY optional for wallet UI
pnpm app:dev                         # product UI — do not rely on Docker app alone
```

`pnpm bootstrap` (`scripts/bootstrap-plume.sh`) is idempotent: ensures `.env` + `app/.env.local`, installs deps if needed, builds contracts and **asserts** non-empty `chain/out`, creates `offchain-db`, `docker compose up -d --build`, waits for API health, optionally registers the shared demo factory when `REUSE_TAP_FACTORY=1`. Use `SKIP_APP=1` to start only mongodb+server.

**Factory model (required reading):**
- **Protocol builder** — owns shared demo factory on Plume (`0xcd6…`, owner TAP Admin `0x366a…`).
- **Transfer agent** — deploys **own** factory via `pnpm deploy-factory` (auto Mongo register); beacon upgrades are theirs.
- **Issuer ADMIN** — `createCapTable` (permissionless) on a factory; wallet manage UI. Using shared factory ≠ owning it.
- **Mongo `factories`** — local mirror only.

**Failure matrix:** `@tap/units` missing on `:3000` → Docker app without `packages/` (fixed in `Dockerfile.app`) or stop Docker app and use `pnpm app:dev`. Empty connect modal → install a browser extension wallet (Rabby, MetaMask — EIP-6963; no cloud key required). `COPY chain/out` fail → run `pnpm setup`. Fresh Mongo has no historical issuers until mint/register/load-from-wallet. Mint OK but register **500** → Docker app `NEXT_PUBLIC_API_URL` must be `http://server:8293`. Poller `invalid BytesLike 0xUPDATE_ME` → placeholder `PRIVATE_KEY`; poller now falls back to read-only when key is missing.

Manual steps (if not using bootstrap):

```bash
pnpm install
pnpm setup
cp .env.example .env
# also create app/.env.local with the same NEXT_PUBLIC_* values
pnpm docker:up   # or: docker compose up -d mongodb server
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
cd chain && forge test --match-test testStockIssuance

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

### Static Analysis & Security

We use a multi-layered security toolchain:

```bash
# Run all security checks
make security

# Individual tools:
make aderyn     # Fast linting (Rust-based, real-time IDE integration)
make slither    # Deep semantic analysis (Python-based, taint tracking)

# Invariant testing (stateful fuzzing)
make test-invariant
```

#### Aderyn

[Aderyn](https://github.com/Cyfrin/aderyn) is a Rust-based Solidity static analyzer. Configured via `aderyn.toml`:

- **Scope**: Production contracts in `chain/src/`
- **Output**: `report.md`
- **VS Code**: Install the [Aderyn Extension](https://marketplace.visualstudio.com/items?itemName=Cyfrin.aderyn) for real-time checks

**Current Status**: 0 High, 5 Low severity findings (all acceptable):
- L-1 (Centralization): Factory owner controls beacon upgrades — intentional design
- L-2/L-3 (Loop issues): Acceptable for batch initialization
- L-4 (State Change Without Event): False positives — events emitted via `TxHelper.createTx()`
- L-5 (Unchecked Return): OpenZeppelin's `_grantRole`/`_revokeRole` are idempotent

#### Slither

[Slither](https://github.com/crytic/slither) (Trail of Bits) provides deeper semantic analysis:

- **Requires**: Python 3.10+ (`pip install slither-analyzer`)
- **Config**: `slither.config.json`
- **Output**: `chain/slither-report.md`
- **CI**: Runs automatically via GitHub Actions on PRs

#### Invariant Testing

Foundry's coverage-guided invariant testing validates protocol-wide properties:

- **Tests**: `chain/test/invariants/CapTableInvariants.t.sol`
- **Handler**: `chain/test/invariants/CapTableHandler.sol`
- **Config**: `chain/foundry.toml` `[invariant]` section

Key invariants tested:
- `shares_issued <= shares_authorized` for issuer and all stock classes
- Stakeholder/stock class index mapping consistency
- Stock class authorized shares never exceed issuer authorized

### Documentation

```bash
# Run docs dev server
pnpm docs:dev

# Build docs for production
pnpm docs:build

# Serve production build
pnpm docs:start
```

The docs are a Nextra/Next.js site in the `docs/` workspace. See `docs/README.md` for more details.

### Documentation DX conventions

When editing pages under `docs/src/pages/`, follow these conventions established during a readability/DX review:

- **Intro paragraphs**: Use plain language. Avoid unexplained implementation terms (e.g. "beacon proxy pattern") unless the page is specifically about that concept.
- **Price/scaling gotchas**: Surface `share_price.amount` scaling rules (**1e10** on write; poller unscales by 1e10) in a `<Callout type="warning">` immediately after the response overview — never only at the bottom of a page. Docs that still say ×10000 are wrong.
- **Dependency lists**: Each tool in an install/setup page should have a one-line purpose annotation so readers understand why it is required.
- **Setup ordering**: `pnpm install` should appear on the install page directly after `git clone`, not deferred to a later setup page.
- **ID format explanations**: When referencing internal ID formats (e.g. bytes16/UUID-without-dashes), explain the exact format and the consequence of omitting or mismatching it.
- **OCF import routes**: Any `multipart/form-data` route should include a concrete `curl -F` example, not just prose.
- **Factory deploy page**: Prefer `pnpm deploy-factory` (auto-register) and `pnpm factory:register` over hand-editing Mongo. Compass remains optional for inspection. Document TA-owned factory vs shared demo clearly; never hardcode a stale implementation address.
- **Diagrams**: Prefer Mermaid fenced blocks (```` ```mermaid ````) over JPG/PNG diagrams for new content. Mermaid renders inline in Nextra, respects light/dark theme, and stays editable in MDX. Existing screenshots stay — do not delete them.

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

The frontend is a Next.js 16 app in the `app/` workspace using styled-components v6, with wallet/onchain support via wagmi, viem, a first-party connect modal, and TanStack Query. It serves the marketing landing page (`/`) and the product workspace under `/app/*` (companies, mint, company cap table). Legacy `/mint` and `/manage*` redirect to `/app`. The UI follows a strict design system (monochrome + rust accent, 4px grid, sans UI copy + mono data) defined in `app/src/components/theme.ts`; the side nav is the working navigation and the top bar is system-only. Generated contract hooks live in `app/src/generated.ts` — regenerate them with `pnpm --filter tap-app generate:wagmi` after contract ABI changes. See [`app/WARP.md`](app/WARP.md) for full frontend conventions.

### Deployment

```bash
# Deploy factory contract
pnpm deploy-factory
# Or with custom env file: ./scripts/deployFactory.sh .env.prod

# The script:
# 1. Sources environment variables
# 2. Runs forge create commands in chain/ directory
# 3. Deploys and links libraries before deploying CapTable and CapTableFactory
```

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
├── chain/              # Foundry project (Solidity contracts)
│   ├── src/            # Smart contracts
│   ├── test/           # Solidity tests
│   ├── script/         # Deploy scripts
│   └── foundry.toml    # Foundry config
├── server/             # API server (Express + Node.js)
│   ├── app.js          # Express app setup
│   ├── server.js       # Main entry point (server + poller)
│   ├── entry.ts        # Standalone poller entry point
│   ├── chain-operations/  # Blockchain interaction
│   │   ├── transactionPoller.ts      # Event polling
│   │   ├── transactionHandlers.js    # Event handlers
│   │   ├── deployCapTable.js         # Deploy contracts
│   │   ├── seed.js                   # Seeding utilities
│   │   └── structs.js                # Solidity struct definitions
│   ├── controllers/    # Business logic for entities
│   ├── db/
│   │   ├── objects/    # Mongoose models
│   │   ├── operations/ # CRUD operations
│   ├── routes/         # Express routes
│   ├── state-machines/ # XState stock lifecycle
│   └── utils/          # Utilities (UUID, OCF validation, etc.)
├── docs/               # Developer documentation (Nextra/Next.js, workspace: tap-docs)
│   ├── src/pages/      # MDX documentation pages
│   └── public/         # Static assets
├── ocf/                # OCF standard (git submodule, workspace)
├── packages/units/     # @tap/units — shared scale / UUID / share-caps
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

Validate all input against OCF schemas:

```javascript
import { validateInputAgainstSchema } from "./utils/validateInputAgainstSchema.js";
validateInputAgainstSchema(data, "Stakeholder", "object");
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

- `.env`: Default development
- `.env.test.local`: Testing (uses separate database)
- Custom files: Pass as argument to scripts

**Key Variables**:

- `DATABASE_URL`: MongoDB connection string
- `DATABASE_REPLSET`: Set to "1" for replica set (enables transactions)
- `RPC_URL`: Ethereum RPC endpoint
- `CHAIN_ID`: Network chain ID (31337 for Anvil, 98866 for Plume Mainnet, 98867 for Plume Testnet)
- `PRIVATE_KEY`: **Dev/demo only**, optional for wallet-first UI. Server-signed API + CLI `deploy-factory` when set; placeholder → poller read-only. Never factory-owner or prod keys in long-running env (see Three keys above)
- `PORT`: API server port (default 8293)
- `NEXT_PUBLIC_FACTORY_ADDRESS`: Deployed CapTableFactory contract address
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID the frontend targets
- `NEXT_PUBLIC_API_URL`: API server URL (default `http://localhost:8293`)
- `NEXT_PUBLIC_OPERATOR_ADDRESS`: Address (not a key) granted OPERATOR_ROLE on new cap tables
- `POLLER_MAX_CONCURRENCY`: Number of issuers processed in parallel per polling cycle (default 5, raised to 8 in `docker-compose.yml`). The only tuning knob the poller exposes; will be removed when the indexer replaces it.

## Working with OCF

The `ocf/` directory is a **git submodule**. When making changes:

```bash
# Update submodule
git submodule update --init --recursive

# Pull latest OCF changes
cd ocf && git pull origin main && cd ..
```

OCF defines the standard for:

- Issuers, Stakeholders, StockClasses
- Transactions (issuances, transfers, cancellations, etc.)
- VestingTerms, StockPlans, StockLegends
- File manifests (`Manifest.ocf.json`)

## Git Workflow

Follow conventional commits and branch from `main`:

- **Never commit to** `main` directly
- Create feature branches from `main`
- PR titles: `feat(scope): description` or `fix(scope): description`
- Commit messages: Descriptive, imperative mood
- All PRs merge into `main` (no separate dev branch)

### Pull Request Descriptions

All PRs must include three sections:

- **What?** - Concise summary of the changes made
- **Why?** - Business or technical motivation for the change
- **How?** - Brief explanation of the implementation approach (optional for trivial changes)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines.

## Database

Uses MongoDB with optional replica set for transactions:

- **Single-node**: `DATABASE_REPLSET=0` (no transaction support)
- **Replica set**: `DATABASE_REPLSET=1` (enables multi-document transactions)

The Docker Compose file creates a single-node setup. For replica sets, use MongoDB's `--replSet` option.

**Models**: Each OCF object type has a corresponding Mongoose model in `server/db/objects/`.

**Note**: Legacy sample data (`server/db/samples/data/`) has been removed. Demo functionality will be provided through the frontend app in a future release.

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

If you encounter "Source file requires different compiler version" errors in VS Code, ensure your Solidity extension is configured to use compiler version 0.8.30 (matching `chain/foundry.toml`):
1. Reload VS Code (Cmd+Shift+P → "Developer: Reload Window")
2. The extension will download the correct compiler version automatically

## Foundry (Solidity)

- **Compiler**: Solidity 0.8.30
- **Config**: `chain/foundry.toml`
- **Optimizer**: Enabled, 200 runs, via-ir
- **Tests**: Use `forge test` with optional filters: `--match-test`, `--match-contract`

Libraries:

- OpenZeppelin v5.4.0 (upgradeable contracts)
- forge-std v1.10.0
- Access control: `AccessControlDefaultAdminRulesUpgradeable`

**Recent Migration (Oct 2025)**:
- Migrated from OpenZeppelin v4.9.2 to v5.4.0
- Updated Solidity from 0.8.20 to 0.8.30 (required for OZ v5)
- Breaking changes addressed:
  - `Ownable` constructor now requires `initialOwner` parameter
  - `UpgradeableBeacon` constructor includes owner parameter
  - Import paths updated for `AccessControlDefaultAdminRules` (now in `extensions/`)

## Common Pitfalls

1. **Forgetting to scale numbers**: Always use `toScaledBigNumber()` for quantities and prices. Direct-wallet hooks must scale on the write side or the poller's 1e10 unscale will produce tiny fractions in Mongo (e.g. `69000` raw → `0.0000069` after unscale).
2. **UUID format mismatch**: Convert UUIDs to bytes16 before contract calls.
3. **Poller not running**: Transactions won't sync to DB without the event poller.
4. **Missing replica set**: Atomic operations fail without `DATABASE_REPLSET=1`.
5. **OCF validation skipped**: Always validate input against schemas.
6. **Contract events not emitted**: Check that contract functions emit expected events.
7. **Preprocessor cache not populated**: Ensure seeding happens after manifest creation.
8. **Mixing `/create` and `/register-onchain` semantics**: `/create` makes the server submit onchain; `/register-onchain` assumes the caller already did. Don't reintroduce a `suppliedId`-style overload on the `/create` route — that pattern was explicitly removed.
9. **Optimistic-state dedupe by stakeholder+stockclass**: Don't. Multiple issuances can exist for the same pair; deduping there hides legitimate in-flight rows. Use a TTL (current: 90s) and let the aggregated holding row absorb the new total once the poller catches up.
10. **MongoDB "Connection ended" log lines are not an error**: they're normal idle connection-pool churn (`connectionCount` ticks down as pooled sockets close). A real failure logs "Error connecting to Mongo". The poller printing `Processing for <issuer>: <block>` with an advancing block number means it is healthy.
11. **Factory config has two independent sources — don't conflate them**: the server reads the factory from the Mongo `factories` collection (`deployCapTable` uses `factories[0].factory_address`); the frontend reads `NEXT_PUBLIC_FACTORY_ADDRESS` from `app/.env.local`. The Docker app service gets `NEXT_PUBLIC_*` from compose env (root `.env`). `pnpm app:dev` reads only `app/.env.local` — keep both files aligned. The factory address is deployment-specific (deployer wallet + nonce) and the implementation is an **upgradeable** beacon target, so **never hardcode them**: `pnpm deploy-factory` auto-registers both from the real deploy, and `pnpm factory:register --factory <addr>` reads the current implementation from the factory onchain (`upsertFactory` keeps a single record — one operator factory, many cap tables). Keep the Mongo factory and `app/.env.local` on the same address. A factory's **owner** (the wallet that deployed it) controls beacon upgrades for all its cap tables. On the shared Plume demo factory that is TAP Admin (`0x366a…`), not your issuer wallet. Only reuse a factory whose owner wallet you control.
12. **Docker Next rewrites vs browser**: `NEXT_PUBLIC_API_URL` drives Next **server-side** `/api/*` rewrites. In the Docker app container use `http://server:8293`. Host `pnpm app:dev` uses `http://localhost:8293` in `app/.env.local`. Wrong value → mint onchain succeeds but register shows Internal Server Error.
13. **Issuing a stakeholder's first stock**: the Issue Stock dropdown needs the issuer's stakeholders, so `GET /cap-table/holdings/stock` returns `stakeholders` (and `stockClasses`) — the manage UI can populate the dropdown before any issuance exists. Don't source the stakeholder list only from `holdings[]`; it's empty until stock is issued, which would make a fresh cap table unable to issue its first shares after a page reload.
14. **Nav issuer id**: company section links must use the real UUID from `router.query.issuerId` (or path), never a pattern string from `pathname` — otherwise users land on `/app/companies/%5BissuerId%5D`.
15. **Ghost stock classes**: registering metadata with `is_onchain_synced: false` after a failed wallet path, or jumping the poller past unprocessed events, leaves classes in Mongo that never landed onchain. Prefer receipt-gated `/register-onchain` (synced + tx_hash) and reconcile over head-jumps for routine refresh.
15. **Transfer already exists onchain/server**: UI transfer is a thin direct-wallet wrapper around `CapTable.transferStock` / TransferStock poller handling — do not invent a parallel transfer protocol or reimplement scaling outside `@tap/units`.

## Debugging

- **Logs**: The server logs extensively. Look for emoji prefixes (✅, ❌, ⏳, 💾)
- **Database**: Connect to MongoDB on port 27017 (credentials in `.env`)
- **Blockchain**: Use RPC_URL to query contract state with ethers.js or cast
- **Event poller**: Runs in-process by default; check console for event processing logs
- **Poller block number stalled or far behind head**: fast-forward the per-issuer index with `pnpm poller:fast-forward` (`--issuer <id>`, `--block <n>`, `--dry-run`, `--help`). It sets `last_processed_block` to (near) chain head so the poller stops chasing a backlog and just tracks new blocks — handy on fast chains (Plume) or after the server was offline. Skips events between the old pointer and head, which is fine for a cap table with no real positions yet.
- **"Connection ended" Mongo logs**: benign idle connection-pool churn, not a connectivity problem (see Common Pitfalls).

## Additional Resources

- Official docs: https://docs.transferagentprotocol.xyz
- OCF standard: https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF
- Foundry book: https://book.getfoundry.sh/
