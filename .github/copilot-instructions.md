# Copilot / AI Agent Instructions for tap-cap-table

Focused guidance to help coding agents work effectively in this repository.

## Quick orientation
- Monorepo using `pnpm` workspaces. Root scripts coordinate `app/`, `server/`, `chain/`, and `docs/`.
- Frontend: [app/README.md](app/README.md) (Next.js workspace `tap-app`).
- API + poller: `server/` (Express + TypeScript; runtime entry points are `server/server.js` and [server/entry.ts](server/entry.ts)).
- Smart contracts: `chain/` (Foundry project; contracts in `chain/src`, tests in `chain/test`).
- Deeper architecture and runbook details: [CLAUDE.md](CLAUDE.md) and [WARP.md](WARP.md).

## Most important commands
- Install dependencies: `pnpm install`
- Full local setup: `pnpm setup`
- Server dev: `pnpm dev`
- Frontend dev: `pnpm app:dev` or `pnpm --filter tap-app dev`
- Frontend build: `pnpm app:build`
- Solidity tests: `cd chain && forge test`
- Solidity build: `cd chain && forge build --via-ir`
- Lint: `pnpm lint`
- Typecheck frontend: `pnpm --filter tap-app typecheck`

Use `pnpm --filter <workspace>` when targeting a single workspace package.

## Project conventions
- Access model is role-based: `ADMIN_ROLE` for governance actions; `OPERATOR_ROLE` for daily cap-table operations.
- Preserve key conversion and math helpers used by contract/server integration:
  - UUID <-> `bytes16` conversion helpers
  - `toScaledBigNumber(value)` fixed-point scaling (1e10)
- OCF schema validation is authoritative for API inputs.
- For Solidity logic changes, prefer updating/adding `.t.sol` tests in `chain/test`.
- Do not alter license boundaries without explicit confirmation (`chain/` BUSL-1.1, `server/` AGPL-3.0, `app/` proprietary, `docs/` MIT).

## Security and secrets
- Never commit secrets or `.env` files.
- If you find a vulnerability, follow [SECURITY.md](SECURITY.md) and report privately.
- Keep keys/endpoints in environment variables (`RPC_URL`, `PRIVATE_KEY`, etc.).

## Model preference
- Preferred model for design/review and high-level reasoning: **Claude Opus 4.6**.

## PR and change hygiene
- Keep diffs minimal and scoped.
- Follow Conventional Commits for PR titles (`type(scope): description`).
- If behavior or API changes, update docs (`README.md` or `docs/`) in the same PR.
