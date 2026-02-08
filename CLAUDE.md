# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Transfer Agent Protocol (TAP) Cap Table — an onchain cap table implementing the [OCF standard](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF). Hybrid architecture: Solidity smart contracts (source of truth) + Express/Node.js API server + MongoDB (off-chain mirror).

**pnpm monorepo** with workspaces:
- `chain/` — Foundry setup (Solidity 0.8.24, OpenZeppelin v5.4.0)
- `server/` — Express API + event poller (TypeScript via tsx)
- `app/` — Next.js frontend (styled-components v6)
- `docs/` — Nextra documentation site
- `ocf/` — OCF standard git submodule

### Licensing

- `chain/`: BUSL-1.1 (converts to AGPLv3 Jan 2028)
- `server/`: AGPL-3.0
- `app/`: UNLICENSED (proprietary)
- `docs/`: MIT

Do not make changes that alter licensing without explicit confirmation.

## Key Patterns

- **UUID ↔ bytes16**: Use `convertUUIDToBytes16()` / `convertBytes16ToUUID()` for all contract interactions.
- **Fixed-point decimals**: Use `toScaledBigNumber(value)` (10^4 precision) for share quantities and prices.
- **OCF validation**: All API inputs must be validated against OCF schemas via `validateInputAgainstSchema()`.
- **Atomic DB operations**: When `DATABASE_REPLSET=1`, use `withGlobalTransaction()` for multi-document writes.
- **Event poller**: The poller (`server/chain-operations/transactionPoller.ts`) syncs onchain events to MongoDB. Without it, state won't sync.

## Development Commands

```bash
pnpm install              # Install deps
pnpm setup                # Foundry + build contracts
pnpm dev                  # Dev server with event poller
pnpm test                 # Solidity tests (forge test)
pnpm test-js              # JS unit tests
pnpm lint                 # Lint TypeScript/JavaScript
pnpm format               # Format all files
pnpm typecheck            # Type check
make security             # Run all security checks (Aderyn + Slither)
make test-invariant       # Foundry invariant tests
```

## Coding Conventions

- **Package manager**: pnpm (never yarn or npm)
- **Solidity tests**: Foundry `.t.sol` files in `chain/test/`
- **TypeScript**: Run via `tsx`, `strict: false` (legacy), `isolatedModules: true`
- **Commits**: Conventional commits, imperative mood (`feat(scope): description`)
- **Branching**: Never commit to `main` directly; branch from `main`
- **Secrets**: Never commit `.env` files or API keys

## Security

- Run `make aderyn` and `make slither` before PRs that modify smart contracts.
- Invariant tests in `chain/test/invariants/` validate protocol-wide properties (shares_issued ≤ shares_authorized, index consistency).
- See `SECURITY.md` for vulnerability reporting.

## PR Review Instructions

When reviewing pull requests:

1. Analyze all changes for potential issues with style, security, correctness, and best practices
2. Check for common bugs, edge cases, and potential vulnerabilities
3. Verify code follows the project conventions documented in this file
4. Provide inline comments on specific lines that need attention
5. Include a summary comment with overall feedback if applicable

### Review focus areas

- Solidity: access control, reentrancy, integer overflow, event emission, gas efficiency
- Server: OCF schema validation, UUID/bytes16 conversions, scaled BigNumbers, atomic DB operations
- Frontend: styled-components theming consistency, Next.js patterns
- General: no hardcoded secrets, proper error handling, test coverage for new functionality
