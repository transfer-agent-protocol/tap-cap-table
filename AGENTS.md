# AGENTS.md

Guidance for AI coding agents working in the Transfer Agent Protocol (TAP) Cap Table monorepo.

The canonical, always-up-to-date agent guidance for this repo lives in the `WARP.md` files. **Read them before making changes:**

- [`WARP.md`](./WARP.md) — monorepo architecture, development commands, important patterns, security tooling, and Git workflow.
- [`app/WARP.md`](./app/WARP.md) — frontend (`tap-app`) conventions: routes under `/app`, styled-components, wallet/web3, generated contract hooks, direct-wallet write path.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — branch, commit, and pull-request conventions.

## Initial setup (agents)

**Goal:** Mongo + API + poller on Plume, then host product UI. Do **not** treat Docker app alone as “ready for wallet work.”

```bash
pnpm install
REUSE_TAP_FACTORY=1 pnpm bootstrap   # Plume stack + register shared demo factory in Mongo
# Fill secrets once in .env AND app/.env.local:
#   NEXT_PUBLIC_OPERATOR_ADDRESS, PRIVATE_KEY (if server-signed / deploy)
# Wallet UI needs a browser extension (optional NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for mobile QR)
pnpm app:dev                         # http://localhost:3000/app  (reads app/.env.local)
```

| Piece | Process |
| --- | --- |
| Mongo + API + poller | Docker via `pnpm bootstrap` / `docker compose up` |
| Product UI / wallet | Host `pnpm app:dev` + `app/.env.local` + browser extension wallet |
| Contract artifacts | `pnpm setup` → `chain/out` (required before server image build) |
| Factory in Mongo | `REUSE_TAP_FACTORY=1` (demo) or `pnpm deploy-factory` (you own it) |

### Factory mental model (do not confuse)

1. **Protocol builder** — ships BUSL contracts; owns the **shared demo** factory on Plume (`0xcd6…`, owner TAP Admin `0x366a…`). Beacon upgrades for that demo deployment.
2. **Transfer-agent business** — deploys **their own** `CapTableFactory` (`pnpm deploy-factory`). That factory is their book of business (many issuer cap tables).
3. **Issuer ADMIN** — calls `createCapTable` on a factory (permissionless); becomes admin of **that** cap table. Wallet manage UI is this path. Using the shared factory ≠ owning it.
4. **Mongo `factories`** — local mirror only (`factory:register` / deploy auto-register). Not onchain ownership.

### Failure matrix (already hit in the wild)

| Symptom | Cause | Fix |
| --- | --- | --- |
| Turbopack `Can't resolve '@tap/units'` on `:3000` | Docker app image missing `packages/` **or** Docker owns port while host expects `app:dev` | Fixed in `docker/Dockerfile.app` (`COPY packages/`); or `docker compose stop app` + `pnpm app:dev` |
| No wallets in connect modal | No browser extension / EIP-6963 | Install Rabby/MetaMask; optional `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` for mobile QR |
| `COPY chain/out` docker build fail | Artifacts missing | `pnpm setup` / `forge build --via-ir`; bootstrap now asserts non-empty `chain/out` |
| Fresh Mongo empty of companies | Poller only tracks registered issuers | Mint new company, or Load from wallet / register existing; not auto-import of all chain history |
| Stale factory impl in docs | Hardcoded old address | Always read impl onchain (`factory:register` does); live beacon ≠ landing screenshot |
| Mint OK, register **500** | Docker app rewrites to `localhost:8293` | Docker: `NEXT_PUBLIC_API_URL=http://server:8293`; host app:dev: `localhost:8293` |
| Poller `0xUPDATE_ME` / invalid BytesLike | Placeholder PRIVATE_KEY | Real hex for server-signed; placeholder OK for read-only poller |

**Plume defaults:** `CHAIN_ID=98866`, `RPC_URL=https://rpc.plume.org`. Prefer mainnet for product work (not Anvil mint).

Bootstrap is idempotent — safe to re-run. Prefer `SKIP_APP=1 pnpm bootstrap` if you only need API and will run `pnpm app:dev` on the host.

## Quick reminders

- Package manager is **pnpm** (pnpm workspace monorepo) — do not use `npm` or `yarn`.
- Never commit directly to `main`; branch from it and open a PR. PR titles follow Conventional Commits.
- The blockchain is the source of truth; the off-chain DB mirrors it via the event poller.
- Don't hand-edit `app/src/generated.ts` — regenerate with `pnpm --filter tap-app generate:wagmi`.
- Shared write-path units live in **`@tap/units`** (`packages/units`): 1e10 scaling, UUID↔bytes16, share-cap checks. Import from there in app and server; don't reintroduce local `scaleAmount` copies or ×10000 docs.
- **Product UI is `/app/*`** (Companies, New company, company workspace). Marketing is `/`. Legacy `/mint` and `/manage*` redirect to `/app`. Frontend dev = `pnpm app:dev`.
- Manage UI write path is **direct-wallet only** (`useDirect*` + `useOnchainAction` + `/register-onchain` for class/person/issuance). **Transfer** = `useDirectTransferStock` → `CapTable.transferStock`; poller mirrors TransferStock — do not call the server transfer API from the UI.
- Company nav: use real `issuerId` via `capTableHref` / `query.issuerId` — never link with a pathname that still contains `[issuerId]`.
- Factory addresses are deployment-specific. Never hardcode impl addresses; keep Mongo `factories` and `app/.env.local` aligned. CLI/Mongo register is **local config**, not product onboarding.
