# CLAUDE.md

Guidance for Claude Code working in the Transfer Agent Protocol (TAP) Cap Table monorepo.

The canonical, always-up-to-date guidance for this repo lives in the `WARP.md` files (and applies equally to Claude Code). **Read them before making changes:**

- [`WARP.md`](./WARP.md) — monorepo architecture, development commands, important patterns, security tooling, and Git workflow.
- [`app/WARP.md`](./app/WARP.md) — frontend (`tap-app`) conventions: routes under `/app`, styled-components, wallet/web3, generated contract hooks, direct-wallet write path.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — branch, commit, and pull-request conventions.

Quick reminders:

- Package manager is **pnpm** (pnpm workspace monorepo) — do not use `npm` or `yarn`.
- Never commit directly to `main`; branch from it and open a PR. PR titles follow Conventional Commits.
- The blockchain is the source of truth; the off-chain DB mirrors it via the event poller.
- Don't hand-edit `app/src/generated.ts` — regenerate with `pnpm --filter tap-app generate:wagmi`.
- Shared write-path units live in **`@tap/units`** (`packages/units`): 1e10 scaling, UUID↔bytes16, share-cap checks. Import from there in app and server; don't reintroduce local `scaleAmount` copies or ×10000 docs.
- **Product UI is `/app/*`** (Companies, New company, company workspace). Marketing is `/`. Legacy `/mint` and `/manage*` redirect to `/app`. Frontend dev = `pnpm app:dev`.
- Manage UI write path is **direct-wallet only** (`useDirect*` + `useOnchainAction` + `/register-onchain` for class/person/issuance). **Transfer** = `useDirectTransferStock` → `CapTable.transferStock`; poller mirrors TransferStock — do not call the server transfer API from the UI.
- Company nav: use real `issuerId` via `capTableHref` / `query.issuerId` — never link with a pathname that still contains `[issuerId]`.
- Factory addresses are deployment-specific (owner = deployer wallet you control). Never hardcode; keep Mongo `factories` and `app/.env.local` aligned.
