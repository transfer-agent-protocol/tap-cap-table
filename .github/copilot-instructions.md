# Copilot / AI Agent Instructions for tap-cap-table

Short, focused guidance to help an AI coding assistant be immediately productive.

## Quick orientation
- Monorepo using `pnpm` (workspace). Top-level `package.json` coordinates scripts for `app/`, `server/`, `chain/`, and `docs/`.
- Frontend: [app/README.md](app/README.md) — Next.js app (`tap-app`).
- API server: `server/` — Express + TypeScript; dev uses `tsx` for hot reload. Entry points: [server/entry.ts](server/entry.ts) (poller) and `server/server.js` (server runtime).
- Smart contracts: `chain/` — Foundry (`forge`) project. Contracts in `chain/src`, tests in `chain/test` (Solidity `.t.sol`).

Note: See `WARP.md` for extended agent-focused developer guidance (architecture, dataflow, and runbook).

## Most important commands (examples)
- Install deps: `pnpm install`
- Run full local dev environment: `pnpm setup` then `pnpm docker:up` then `pnpm dev`
- Run server only (dev): `pnpm dev` (top-level runs `tsx watch server/server.js`)
- Run frontend only: `pnpm app:dev` or `pnpm --filter tap-app dev`
- Build frontend: `pnpm app:build`
- Foundry build/test: `cd chain && forge build --via-ir` and `cd chain && forge test`
- Deploy factory script: `pnpm deploy-factory` (calls `./scripts/deployFactory.sh`)
- Docker: `pnpm docker:up|docker:down|docker:logs|docker:build`

Docker compose notes: `docker-compose.yml` creates services `mongodb`, `server`, `app`. `offchain-db` volume is external; `DATABASE_REPLSET` defaults to `0` in compose. The `server` container depends on the `mongodb` healthcheck and exposes port `8293`.

Use `pnpm --filter <package>` when targeting a workspace package.

## Development workflows & gotchas
- Local blockchain: many workflows expect a Foundry `anvil` node. The README notes you must run `anvil` and copy a private key into `.env` for local testing.
- `pnpm setup` runs `foundryup` and a `forge build --via-ir` (see top-level `package.json` scripts). Foundry uses `via_ir` and `solc_version = '0.8.24'` (see [chain/foundry.toml](chain/foundry.toml)).
- Server process in production uses `tsx server/server.js` (`prod` script). The poller uses [server/entry.ts](server/entry.ts) for long-running event processing; flags: `--finalized-only`.
- Tests: Solidity tests live under `chain/test` and are run with `forge test`. JS/TS unit tests are not present in root — prioritize Foundry tests for contract logic.

Additional test notes: `WARP.md` documents JS unit/integration test locations under `server/tests/` and how to run filtered Foundry tests (e.g., `cd chain && forge test --match-test testStockIssuance`).

## Project-specific conventions
- Monorepo package names: `tap-app` (frontend), `tap-docs` (docs), etc. Use `pnpm --filter` to target them.
- Smart contract tests are Solidity-based (`.t.sol`) using Forge. Prefer modifying/adding `.t.sol` tests rather than creating JS wrappers unless integration with off-chain logic is required.
- The project uses `tsx` to run TypeScript files without a separate build step in dev; be careful when editing runtime entry files (server/server.js vs entry.ts).
- License split is intentional: `chain/` is BUSL-1.1, `server/` AGPL-3.0, `app/` proprietary. Avoid changes that would alter licensing without confirmation.

Security & reporting: See `SECURITY.md`. If you find a vulnerability, do not open public issues — email maintainers. Known vulnerabilities exist in the `ocf/` submodule documentation tooling; they do not affect runtime code. Prefer `pnpm audit` for dependency checks and never suggest committing real `.env` files.

## Integration points to watch
- MongoDB: server expects Mongo at `localhost:27017` when running locally (Docker compose spins up Mongo).
- RPC endpoints and Etherscan keys: configured in [chain/foundry.toml](chain/foundry.toml) (`RPC_URL`, `plume_*` endpoints). Use environment variables for keys and endpoints.
- Off-chain <-> on-chain: server `chain-operations` folder contains the event poller and transaction handling. When changing contract ABIs or deploy flow, update server handlers accordingly.

Patterns to preserve (from `WARP.md`):
- UUID <-> `bytes16` conversions: use provided helpers before contract calls.
- Fixed-point scaling: use `toScaledBigNumber(value)` for quantities/prices (10^4 precision).
- OCF schema validation is authoritative for API inputs; reference `ocf/` schemas.
- When `DATABASE_REPLSET=1`, use `withGlobalTransaction()` for atomic DB operations.
- Event poller is critical: without it, onchain events won't sync to MongoDB. Poller can run via `server/entry.ts` with `--finalized-only`.

Static analysis: Aderyn is used for smart-contract scanning. See `aderyn.toml` at the repository root (configured with `root = "chain"`). Run Aderyn locally or via CI to detect contract issues before opening PRs.

## Helpful files to inspect (examples)
- Root README: [README.md](README.md)
- Monorepo scripts & configuration: [package.json](package.json)
- Frontend package.json: [app/package.json](app/package.json)
- Foundry config: [chain/foundry.toml](chain/foundry.toml)
- Server poller entry: [server/entry.ts](server/entry.ts)
- Dev helper scripts: `scripts/dev.sh`, `scripts/deployFactory.sh`

Contributing & PRs: follow `CONTRIBUTING.md` — never commit to `main`, branch from `main`, and use Conventional Commit style for PR titles (`feat(scope): description`).

Model preferences: the repository owner prefers outputs from Claude Opus 4.5 for high-level reasoning; for heavy code-generation or large-context code reasoning, it's acceptable to use GPT-4.2 or Grok code. Document this preference in the agent guide so human reviewers can choose the model when running agent tooling.

## How to propose changes (for the agent)
- Keep diffs minimal and target the correct workspace package.
- For contract changes: update `chain/src`, run `cd chain && forge test`, then run integration checks against the server handlers that use those contracts.
- For frontend changes: run `pnpm app:dev` to verify UI behavior locally.

If anything above is unclear or you'd like me to include extra examples (PR checklist, CI notes, or sample commands for running `anvil` + poller), tell me which area to expand.

## PR Checklist (for agents)
- **Branching**: Don't commit to `main`; create feature branch from `main`.
- **Format & Lint**: Run `pnpm format` and `pnpm lint` (or ensure CI covers it).
- **Typecheck**: Run `pnpm typecheck` or `pnpm --filter tap-app typecheck` for frontend changes.
- **Tests**: Run `cd chain && forge test` for contract changes; run JS tests under `server/tests/` when present.
- **Secrets**: Never add keys or `.env` files to commits. If needed, suggest using secrets or secure storage.
- **Docs**: If behavior or API changes, update `docs/` or `README.md` and include a short changelog entry.
- **CI**: Ensure changes pass the CI steps in `.github/workflows/ci.yml` (lint + typecheck + submodule checkout).

## CI & automation notes
- CI (`.github/workflows/ci.yml`) runs on `push` and executes:
	- Checkout (with submodules)
	- Install Node and `pnpm`
	- `pnpm install --frozen-lockfile`
	- `pnpm lint` (root, docs, app) and `pnpm --filter tap-app typecheck`
- Dependabot (`.github/dependabot.yml`) keeps deps updated for root and `app/` workspaces and GH Actions.
- PR review workflow (`.github/workflows/review-pr.yml`) runs a Warp agent (`warpdotdev/warp-agent-action`) to auto-review new PRs:
	- Automatically posts inline comments on PR diffs for potential issues
	- Provides general summary comments with overall feedback
	- Checks style, security, correctness, and project conventions
	- Requires `secrets.WARP_AGENT_API_KEY` and `pull-requests: write` permission

## Agent/tooling preferences
- Owner preference: Claude Opus 4.5 for high-level reasoning and design; GPT-4.2 or Grok Code acceptable for heavy codegen or large-context analysis. Document model choice in PR descriptions when an agent (or human) made substantive code changes.
- Warp: The repo includes a Warp review action. When using Warp for automated code changes, ensure the generated commits follow the PR checklist above and note the Warp run in the PR body.

## Notes & TODOs
- Poller: the onchain `event poller` (in `server/chain-operations/transactionPoller.ts` / `server/entry.ts`) is known technical debt and should be replaced soon — prefer proposing a migration plan rather than incremental fixes.

---

If you'd like, I can: add an `examples/` snippet showing how to run `anvil` + the poller locally, or append a short PR template that expands the minimal `pull_request_template.md` into a checklist-style template. Which would you prefer?
