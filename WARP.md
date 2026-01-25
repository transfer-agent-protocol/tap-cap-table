# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

**Note**: For additional agent-focused guidance compatible with GitHub Copilot and other AI coding assistants, see `.github/copilot-instructions.md`.

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

3. **Express API** (`server/app.js`, `server/routes/`):
    - REST endpoints for issuers, stakeholders, stock classes, transactions, etc.
    - Validates input against OCF schemas (`ocf/schema/`)
    - Submits transactions to smart contracts
    - Routes: `/cap-table`, `/factory`, `/issuer`, `/stakeholder`, `/stock-class`, `/transactions`, etc.

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

### Data Flow

**Transaction Creation**:

1. API receives OCF-formatted transaction request
2. Validates against OCF schema
3. Converts to Solidity structs and submits to contract
4. Transaction emits events onchain
5. Event poller picks up events and updates MongoDB

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

# Start local MongoDB (via Docker)
docker-compose up -d

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, RPC_URL, PRIVATE_KEY, CHAIN_ID
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

# JavaScript unit tests
pnpm test-js

# JavaScript integration tests
pnpm test-js-integration

# Run specific test
cd chain && forge test --match-test testStockIssuance

# Invariant tests (stateful fuzzing)
make test-invariant           # Standard run (256 runs, 50 depth)
make test-invariant-deep      # Deep run (2000 runs, 100 depth)
```

**Test Files**:

- Solidity: `chain/test/*.t.sol` (Foundry tests)
- Invariant tests: `chain/test/invariants/*.sol`
- JavaScript: `server/tests/unit/` and `server/tests/integration/`

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
- L-1 (Centralization): Intentional admin-controlled design
- L-2/L-3 (Loop issues): Acceptable for batch initialization
- L-4 (State Change Without Event): False positives - events emitted via `TxHelper.createTx()`
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

### Frontend App

```bash
# Run frontend dev server
pnpm app:dev

# Build frontend for production
pnpm app:build

# Serve production build
pnpm app:start
```

The frontend is a Next.js app in the `app/` workspace using styled-components v6.

### Deployment

```bash
# Deploy factory contract
pnpm deploy-factory
# Or with custom env file: ./scripts/deployFactory.sh .env.prod

# The script:
# 1. Sources environment variables
# 2. Runs forge script in chain/ directory
# 3. Uses script/CapTableFactory.s.sol
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
│   │   └── samples/    # Sample OCF data
│   ├── routes/         # Express routes
│   ├── state-machines/ # XState stock lifecycle
│   ├── tests/          # JavaScript tests
│   └── utils/          # Utilities (UUID, OCF validation, etc.)
├── docs/               # Developer documentation (Nextra/Next.js, workspace: tap-docs)
│   ├── src/pages/      # MDX documentation pages
│   └── public/         # Static assets
├── ocf/                # OCF standard (git submodule, workspace)
├── .env.example        # Environment template
├── docker-compose.yml  # MongoDB setup
├── pnpm-workspace.yaml # Workspace config
└── package.json        # Root scripts and server dependencies
```

## Important Patterns

### UUID ↔ bytes16 Conversion

UUIDs (128-bit) are stored as `bytes16` in Solidity. Use:

- `convertUUIDToBytes16()` before sending to contract
- `convertBytes16ToUUID()` after reading from contract

### Fixed-Point Decimals

Share quantities and prices use scaled BigNumbers (10^4 precision):

- `toScaledBigNumber(value)` to convert before contract calls
- Always scale quantities and prices in transaction parameters

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

The repository includes `.vscode/settings.json` for proper Solidity development:

- **Solidity Compiler**: v0.8.24+commit.e11b9ed9 (matches Foundry config)
- **Formatter**: Uses Forge for consistent formatting

If you encounter "Source file requires different compiler version" errors in VS Code:
1. Reload VS Code (Cmd+Shift+P → "Developer: Reload Window")
2. The extension will download the correct compiler version automatically

## Foundry (Solidity)

- **Compiler**: Solidity 0.8.24
- **Config**: `chain/foundry.toml`
- **Optimizer**: Enabled, 200 runs, via-ir
- **Tests**: Use `forge test` with optional filters: `--match-test`, `--match-contract`

Libraries:

- OpenZeppelin v5.4.0 (upgradeable contracts)
- forge-std v1.10.0
- Access control: `AccessControlDefaultAdminRulesUpgradeable`

**Recent Migration (Oct 2025)**:
- Migrated from OpenZeppelin v4.9.2 to v5.4.0
- Updated Solidity from 0.8.20 to 0.8.24 (required for OZ v5)
- Breaking changes addressed:
  - `Ownable` constructor now requires `initialOwner` parameter
  - `UpgradeableBeacon` constructor includes owner parameter
  - Import paths updated for `AccessControlDefaultAdminRules` (now in `extensions/`)

## Common Pitfalls

1. **Forgetting to scale numbers**: Always use `toScaledBigNumber()` for quantities and prices
2. **UUID format mismatch**: Convert UUIDs to bytes16 before contract calls
3. **Poller not running**: Transactions won't sync to DB without the event poller
4. **Missing replica set**: Atomic operations fail without `DATABASE_REPLSET=1`
5. **OCF validation skipped**: Always validate input against schemas
6. **Contract events not emitted**: Check that contract functions emit expected events
7. **Preprocessor cache not populated**: Ensure seeding happens after manifest creation

## Debugging

- **Logs**: The server logs extensively. Look for emoji prefixes (✅, ❌, ⏳, 💾)
- **Database**: Connect to MongoDB on port 27017 (credentials in `.env`)
- **Blockchain**: Use RPC_URL to query contract state with ethers.js or cast
- **Event poller**: Runs in-process by default; check console for event processing logs

## Additional Resources

- Official docs: https://docs.transferagentprotocol.xyz
- OCF standard: https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF
- Foundry book: https://book.getfoundry.sh/
