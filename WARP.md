# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Transfer Agent Protocol (TAP) Cap Table is an on-chain cap table implementation that combines Solidity smart contracts with an off-chain Node.js API server. It implements the [Open Cap Table Coalition (OCF)](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard for representing cap table data.

## Architecture

### Hybrid On-chain/Off-chain Design

The system maintains a **dual-state architecture**:

- **On-chain (Ethereum/L2)**: Smart contracts (CapTable.sol, CapTableFactory.sol) store authoritative transaction data and active positions
- **Off-chain (MongoDB + Node.js)**: Express API server stores OCF-compliant objects and metadata, processes blockchain events

**Critical**: The blockchain is the source of truth for transactions. The off-chain database mirrors this state by listening to contract events via the transaction poller.

### Key Components

1. **Solidity Contracts** (`chain/src/`):
    - `CapTable.sol`: Core contract managing stakeholders, stock classes, transactions, and active positions
    - `CapTableFactory.sol`: Deploys new CapTable instances for issuers
    - Supports: stock issuance, transfers, cancellations, repurchases, reissuances, adjustments

2. **Event Poller** (`src/chain-operations/transactionPoller.ts`):
    - Long-running process that polls blockchain for contract events
    - Processes events through XState state machines (`src/state-machines/`)
    - Synchronizes on-chain state to MongoDB
    - Can run in two modes: `--finalized-only` (production) or latest blocks (testing)

3. **Express API** (`src/app.js`, `src/routes/`):
    - REST endpoints for issuers, stakeholders, stock classes, transactions, etc.
    - Validates input against OCF schemas (`ocf/schema/`)
    - Submits transactions to smart contracts
    - Routes: `/cap-table`, `/factory`, `/issuer`, `/stakeholder`, `/stock-class`, `/transactions`, etc.

4. **State Machines** (`src/state-machines/`):
    - XState machines model stock lifecycle: Issued → Transferred/Cancelled/Retracted/Reissued/Repurchased
    - Used to maintain active positions and track security IDs by stock class

5. **Database Layer** (`src/db/`):
    - Mongoose models for OCF objects (Issuer, Stakeholder, StockClass, VestingTerms, etc.)
    - Atomic operations with MongoDB transactions when `DATABASE_REPLSET=1`
    - Seeding utilities in `src/db/samples/`

6. **OCF Submodule** (`ocf/`):
    - Git submodule containing the Open Cap Format standard
    - JSON schemas used for validation
    - Sample OCF files in `ocf/samples/`

### Data Flow

**Transaction Creation**:

1. API receives OCF-formatted transaction request
2. Validates against OCF schema
3. Converts to Solidity structs and submits to contract
4. Transaction emits events on-chain
5. Event poller picks up events and updates MongoDB

**Seeding**:
When a manifest is created, the system:

1. Creates stakeholders and stock classes on-chain
2. Seeds `shares_authorized` and `shares_issued` for issuer and stock classes
3. Seeds active positions and security IDs from preprocessor cache

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

- `src/server.js`: Express server with optional poller
- `src/entry.ts`: Standalone event poller

**Options**:

- `--finalized-only`: Only process finalized blocks (safer for production)
- `--no-poller`: Disable event poller (useful when running poller separately)

### Testing

```bash
# Solidity tests (Foundry)
pnpm test
# Or: cd chain && forge test

# JavaScript unit tests
pnpm test-js

# JavaScript integration tests
pnpm test-js-integration

# Run specific test
cd chain && forge test --match-test testStockIssuance
```

**Test Files**:

- Solidity: `chain/test/*.t.sol` (Foundry tests)
- JavaScript: `src/tests/unit/` and `src/tests/integration/`

### Linting and Formatting

```bash
# Lint TypeScript/JavaScript
pnpm lint

# Format all files
pnpm format

# Type check
pnpm typecheck
```

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
├── chain/              # Foundry project (Solidity contracts)
│   ├── src/            # Smart contracts
│   ├── test/           # Solidity tests
│   ├── script/         # Deploy scripts
│   └── foundry.toml    # Foundry config
├── src/
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
├── ocf/                # OCF standard (git submodule)
├── .env.example        # Environment template
├── docker-compose.yml  # MongoDB setup
└── package.json        # Node dependencies and scripts
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
- `CHAIN_ID`: Network chain ID (31337 for Anvil, 32586980208 for Arbitrum)
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

Follow conventional commits and branch from `dev`:

- **Never commit to** `main` or `dev` directly
- Create feature branches from `dev`
- PR titles: `feat(scope): description` or `fix(scope): description`
- Commit messages: Descriptive, imperative mood

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines.

## Database

Uses MongoDB with optional replica set for transactions:

- **Single-node**: `DATABASE_REPLSET=0` (no transaction support)
- **Replica set**: `DATABASE_REPLSET=1` (enables multi-document transactions)

The Docker Compose file creates a single-node setup. For replica sets, use MongoDB's `--replSet` option.

**Models**: Each OCF object type has a corresponding Mongoose model in `src/db/objects/`.

## TypeScript Configuration

The project uses TypeScript with:

- `target: ESNext`, `module: ESNext`
- `allowJs: true` (mixed TS/JS codebase)
- `strict: false` (legacy code)
- `isolatedModules: true` (for tsx)
- `allowImportingTsExtensions: true`

Use `tsx` for running TypeScript files directly (already configured in scripts).

## Foundry (Solidity)

- **Compiler**: Solidity 0.8.20
- **Config**: `chain/foundry.toml`
- **Optimizer**: Enabled, 200 runs, via-ir
- **Tests**: Use `forge test` with optional filters: `--match-test`, `--match-contract`

Libraries:

- OpenZeppelin (upgradeable contracts)
- Access control: `AccessControlDefaultAdminRulesUpgradeable`

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
