# AGENTS.md

Guidance for AI coding agents working in the Transfer Agent Protocol (TAP) Cap Table monorepo.

The canonical, always-up-to-date agent guidance for this repo lives in the `WARP.md` files. Read them before making changes:

- [`WARP.md`](./WARP.md) — monorepo architecture, development commands, important patterns, security tooling, and Git workflow.
- [`app/WARP.md`](./app/WARP.md) — frontend (`tap-app`) conventions: styled-components, wallet/web3 (wagmi + viem + Reown AppKit), generated contract hooks, and onchain data conventions.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — branch, commit, and pull-request conventions.

Quick reminders:

- Package manager is **pnpm** (this is a pnpm workspace monorepo) — do not use `npm` or `yarn`.
- Never commit directly to `main`; branch from it and open a PR. PR titles follow Conventional Commits.
- The blockchain is the source of truth; the off-chain DB mirrors it via the event poller.
- Don't hand-edit `app/src/generated.ts` — regenerate it with `pnpm --filter tap-app generate:wagmi`.
