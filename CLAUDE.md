# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Transfer Agent Protocol (TAP) Cap Table — onchain cap table implementing the [OCF standard](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF). pnpm monorepo with Solidity smart contracts, Express API server, Next.js frontend, and Nextra docs site.

## Common Commands

### Build & Test
```bash
pnpm install                    # Install all workspace deps
pnpm setup                      # foundryup + forge build --via-ir
pnpm test                       # Solidity tests (cd chain && forge test)
cd chain && forge test --match-test testStockIssuance  # Single Solidity test
make test-invariant             # Invariant fuzzing (256 runs, 50 depth)
make test-invariant-deep        # Deep invariant fuzzing (2000 runs, 100 depth)
```

### Lint, Format, Typecheck
```bash
pnpm lint                       # ESLint across root, docs, app
pnpm format                     # Prettier formatting
pnpm typecheck                  # TypeScript validation (concurrent)
```

### Run Services
```bash
pnpm dev                        # Server + event poller (tsx watch)
pnpm app:dev                    # Frontend dev server
pnpm docs:dev                   # Docs dev server (port 3001)
pnpm docker:up                  # Start MongoDB + server + app via Docker
pnpm docker:down                # Stop Docker services
```

### Deploy & Security
```bash
pnpm deploy-factory             # Deploy CapTableFactory (calls scripts/deployFactory.sh)
make security                   # Run Aderyn + Slither static analysis
make aderyn                     # Aderyn only → report.md
make slither                    # Slither only → chain/slither-report.md
```

## Architecture

### Hybrid Onchain/Off-chain Design
- **Blockchain (source of truth)**: `CapTable.sol` and `CapTableFactory.sol` store authoritative transactions and active positions
- **MongoDB + Express API** (`server/`): Mirrors onchain state via event poller, stores OCF-compliant metadata, validates input against OCF schemas
- **Event poller** (`server/chain-operations/transactionPoller.ts`): Long-running process polls blockchain events, processes them through XState state machines (`server/state-machines/`), and syncs to MongoDB

### Three-Tier Access Control
- **ADMIN_ROLE** (asset manager wallet): Governance — grants/revokes roles. `msg.sender` of `createCapTable()` gets ADMIN. Admins are implicitly operators.
- **OPERATOR_ROLE** (TAP server): Day-to-day operations — stock issuance, transfers, cancellations, stakeholder/stock class management.
- **Factory owner**: Controls `UpgradeableBeacon` — can upgrade CapTable implementation for all proxies. No access to individual cap tables.

Cap table creation is permissionless via `createCapTable()` on the factory.

### Monorepo Structure
- `chain/` — Foundry project. Solidity 0.8.30, via-ir, optimizer 200 runs. OpenZeppelin v5.4.0. Tests in `chain/test/*.t.sol`, invariants in `chain/test/invariants/`.
- `server/` — Express API + event poller. Entry: `server/server.js` (server+poller) or `server/entry.ts` (standalone poller). Routes in `server/routes/`, Mongoose models in `server/db/objects/`, XState machines in `server/state-machines/`.
- `app/` — Next.js 16, React 19, styled-components v6, wagmi v3 + @reown/appkit. Workspace name: `tap-app`. API calls rewritten via Next.js rewrites to `NEXT_PUBLIC_API_URL`.
- `docs/` — Nextra docs site. Workspace name: `tap-docs`.
- `ocf/` — Git submodule with OCF standard schemas and samples.

### Data Flow
1. API receives OCF-formatted request → validates against OCF schema
2. Converts to Solidity structs → submits transaction to contract
3. Contract emits events onchain
4. Event poller picks up events → XState state machines process → updates MongoDB

### Key Patterns
- **UUID ↔ bytes16**: Use `convertUUIDToBytes16()` / `convertBytes16ToUUID()` for all contract interactions
- **Fixed-point scaling**: Use `toScaledBigNumber(value)` for quantities/prices (1e10 precision)
- **OCF validation**: All API inputs validated with `validateInputAgainstSchema(data, type, "object")`
- **Atomic DB ops**: When `DATABASE_REPLSET=1`, use `withGlobalTransaction()` for multi-document operations
- **Contract middleware**: Routes needing contract access use `contractMiddleware` (requires `issuerId` in body, attaches `req.contract` and `req.provider`)

## Environment

Key variables (see `.env.example`):
- `RPC_URL`, `CHAIN_ID`, `PRIVATE_KEY` — blockchain connection
- `DATABASE_URL`, `DATABASE_REPLSET` — MongoDB (replset=1 enables transactions)
- `NEXT_PUBLIC_FACTORY_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_OPERATOR_ADDRESS`, `NEXT_PUBLIC_REOWN_PROJECT_ID` — frontend config

Supported networks: Anvil (31337), Plume Mainnet (98866), Plume Testnet (98867).

## Conventions

- **Commits**: Conventional Commits format — `feat(scope): description`, `fix(scope): description`
- **Branching**: Never commit to `main`. Feature branches from `main`, PRs back to `main`.
- **PR descriptions**: Must include What?, Why?, and How? sections.
- **Solidity tests**: Prefer `.t.sol` Foundry tests over JS wrappers unless testing off-chain integration.
- **Formatting**: 4-space indent, 150 char line width, double quotes, trailing commas (es5). Pre-commit hook runs lint-staged via husky.
- **License split**: `chain/` is BUSL-1.1, `server/` is AGPL-3.0, `app/` is proprietary, `docs/` is MIT. Do not alter licensing without confirmation.
- **Mixed TS/JS**: Server uses both `.js` and `.ts` files. `tsx` runs TypeScript directly without a build step.
- **Event poller**: Known technical debt — prefer proposing migration plans over incremental fixes.
