# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Transfer Agent Protocol (TAP) Cap Table is an onchain cap table implementation that combines Solidity smart contracts with an off-chain Node.js API server. It implements the [Open Cap Table Coalition (OCF)](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard for representing cap table data.

This is a **pnpm monorepo** with the following workspaces:
- `app/` - Next.js frontend (tap-app)
- `docs/` - Nextra documentation site (tap-docs)
- `ocf/` - OCF standard git submodule

### Licensing

This project uses a dual-license structure:

- **Core Protocol (`chain/`)**: BUSL-1.1 (converts to AGPLv3 on January 1, 2028)
- **Offchain Server (`server/`)**: AGPL-3.0
- **Frontend (`app/`)**: UNLICENSED (proprietary)
- **Documentation (`docs/`)**: MIT

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
- **Factory owner** (protocol deployer): Controls the `UpgradeableBeacon`, can upgrade the `CapTable` implementation for ALL proxies via `updateCapTableImplementation()`. Has no access to individual cap tables.

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
    - Processes events through XState state machines (`server/state-machines/`)
    - Synchronizes onchain state to MongoDB
    - Can run in two modes: `--finalized-only` (production) or latest blocks (testing)
    - **Slated for replacement by a proper indexer.** Kept intentionally simple: round-robin across issuers with `runWithConcurrency` (`POLLER_MAX_CONCURRENCY`, default 5). Per-cycle query window is `maxBlocks=5000` (raised from the historical 500 to drain backlog faster on fast chains like Plume) with a `maxEvents=250` safety cap per DB transaction. Do not re-add prioritization/backoff/dynamic-sleep machinery — the indexer will obviate it.

3. **Express API** (`server/app.js`, `server/routes/`):
    - REST endpoints for issuers, stakeholders, stock classes, transactions, etc.
    - Validates input against OCF schemas (`ocf/schema/`)
    - Submits transactions to smart contracts
    - Routes: `/cap-table`, `/factory`, `/issuer`, `/stakeholder`, `/stock-class`, `/transactions`, etc.
    - **Two route conventions** for entity creation:
      - `POST /<entity>/create` — server-signed (server's OPERATOR key submits onchain, then persists metadata). Legacy default.
      - `POST /<entity>/register-onchain` — caller's wallet already submitted onchain (direct flow); endpoint only validates + persists metadata. The poller is still authoritative for the resulting record. Currently exposed for `/stakeholder`, `/stock-class`, and `/transactions/issuance/stock`.
    - `GET /issuer/by-deployer/:address` — list issuers a given admin wallet deployed (uses the new `Issuer.deployed_by` field).
    - `GET /issuer/full/:id` — full Issuer document (read-only) for the management UI.

4. **State Machines** (`server/state-machines/`):
    - XState machines model stock lifecycle: Issued → Transferred/Cancelled/Retracted/Reissued/Repurchased
    - Used to maintain active positions and track security IDs by stock class

5. **Database Layer** (`server/db/`):
    - Mongoose models for OCF objects (Issuer, Stakeholder, StockClass, VestingTerms, etc.)
    - Atomic operations with MongoDB transactions when `DATABASE_REPLSET=1`

6. **OCF Submodule** (`ocf/`):
    - Git submodule containing the Open Cap Format standard
    - JSON schemas used for validation
    - Sample OCF files in `ocf/samples/`

7. **Frontend Cap Table Management UI** (`app/src/pages/manage/`, `app/src/components/CapTableDashboard.tsx`):
    - `/manage` — hub listing all cap tables the connected admin wallet has deployed (queries `/issuer/by-deployer/:address` + a localStorage fallback for legacy mints with no `deployed_by`).
    - `/manage/cap-table?issuerId=...` — full-screen dashboard for a specific cap table. Forms create stock classes, stakeholders, and stock issuances directly from the connected wallet.
    - Optimistic state for direct creations carries a 90s TTL — the chain assigns issuance ids internally, so we can't reliably match optimistic items to poller-written records.

### Data Flow

**Transaction Creation (server-signed, legacy)**:

1. API receives OCF-formatted transaction request at `/<entity>/create`
2. Validates against OCF schema
3. Converts to Solidity structs and submits to contract via the server's OPERATOR key
4. Transaction emits events onchain
5. Event poller picks up events and updates MongoDB

**Transaction Creation (direct wallet, current default for the `/manage` UI)**:

1. Frontend generates a bytes16 id and submits the tx from the connected admin wallet via wagmi (`useDirectCreateStockClass`, `useDirectCreateStakeholder`, `useDirectIssueStock`). The chain assigns issuance + security ids internally for `issueStock`; the frontend supplies its own ids only for `createStakeholder` and `createStockClass`.
2. Frontend POSTs OCF metadata to `/<entity>/register-onchain`. Server validates and persists offchain metadata; **does not** submit onchain again.
3. The poller is still authoritative — it picks up the TxCreated/StakeholderCreated/StockClassCreated event and writes the canonical record (joining on the bytes16 id where applicable).

**Minting**:
When a manifest is created, the system:

1. Creates stakeholders and stock classes onchain
2. Mints `shares_authorized` and `shares_issued` for issuer and stock classes
3. Mints active positions and security IDs from preprocessor cache

## Development Commands

### Setup

```bash
# Install dependencies
pnpm install

# Setup Foundry and build contracts
pnpm setup

# Start all services via Docker (MongoDB, server, app)
pnpm docker:up

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, RPC_URL, PRIVATE_KEY, CHAIN_ID, and NEXT_PUBLIC_* vars
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
- **Price/scaling gotchas**: Surface `share_price.amount` scaling rules (÷10000) in a `<Callout type="warning">` immediately after the response overview — never only at the bottom of a page.
- **Dependency lists**: Each tool in an install/setup page should have a one-line purpose annotation so readers understand why it is required.
- **Setup ordering**: `pnpm install` should appear on the install page directly after `git clone`, not deferred to a later setup page.
- **ID format explanations**: When referencing internal ID formats (e.g. bytes16/UUID-without-dashes), explain the exact format and the consequence of omitting or mismatching it.
- **OCF import routes**: Any `multipart/form-data` route should include a concrete `curl -F` example, not just prose.
- **Factory deploy page**: Keep changes to this page minimal — the MongoDB Compass GUI flow is intentional and should not be replaced with a CLI alternative.
- **Diagrams**: Prefer Mermaid fenced blocks (```` ```mermaid ````) over JPG/PNG diagrams for new content. Mermaid renders inline in Nextra, respects light/dark theme, and stays editable in MDX. Existing screenshots stay — do not delete them.

### Frontend App

```bash
# Run frontend dev server
pnpm app:dev

# Build frontend for production
pnpm app:build

# Serve production build
pnpm app:start
```

The frontend is a Next.js 16 app in the `app/` workspace using styled-components v6, with wallet/onchain support via wagmi, viem, Reown AppKit, and TanStack Query. It serves both the landing page and the wallet-based cap-table minting/management UI (`/mint`, `/manage`). Generated contract hooks live in `app/src/generated.ts` — regenerate them with `pnpm --filter tap-app generate:wagmi` after contract ABI changes. See [`app/WARP.md`](app/WARP.md) for full frontend conventions.

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
│   │   ├── pages/      # Next.js pages
│   │   └── components/ # React components
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
- The poller unscales by 1e10 on read (`toDecimal()` in `transactionHandlers.js`). Any new direct-wallet path must scale on the write side to match — see `app/src/hooks/useDirectIssueStock.ts` where `scaleAmount` (1e10) is applied to both `quantity` and `share_price`.

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
- `PRIVATE_KEY`: Deployer private key
- `PORT`: API server port (default 8293)
- `NEXT_PUBLIC_REOWN_PROJECT_ID`: WalletConnect project ID from https://cloud.reown.com
- `NEXT_PUBLIC_FACTORY_ADDRESS`: Deployed CapTableFactory contract address
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID the frontend targets
- `NEXT_PUBLIC_API_URL`: API server URL (default `http://localhost:8293`)
- `NEXT_PUBLIC_OPERATOR_ADDRESS`: Server wallet address to receive OPERATOR_ROLE on new cap tables
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

## Debugging

- **Logs**: The server logs extensively. Look for emoji prefixes (✅, ❌, ⏳, 💾)
- **Database**: Connect to MongoDB on port 27017 (credentials in `.env`)
- **Blockchain**: Use RPC_URL to query contract state with ethers.js or cast
- **Event poller**: Runs in-process by default; check console for event processing logs

## Additional Resources

- Official docs: https://docs.transferagentprotocol.xyz
- OCF standard: https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF
- Foundry book: https://book.getfoundry.sh/
