# AGENTS.md

Guidance for AI coding agents working in the Transfer Agent Protocol (TAP) Cap Table monorepo.

Architecture, commands, and conventions live in the `WARP.md` files; this file adds the agent setup path, factory model, and failure matrix. **Read them before making changes:**

- [`WARP.md`](./WARP.md) — monorepo architecture, development commands, important patterns, and Git workflow.
- [`app/WARP.md`](./app/WARP.md) — frontend (`tap-app`) conventions: routes under `/app`, styled-components, wallet/web3, generated contract hooks, direct-wallet write path.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — branch, commit, and pull-request conventions.
- Setup docs: [`docs/src/content/development/setup.mdx`](./docs/src/content/development/setup.mdx) (not `docs/src/pages/`). Local stack troubleshooting: [`docs/src/content/development/run-server.mdx`](./docs/src/content/development/run-server.mdx).
- API behavior, scaling, signer requirements, and Known issues: [`docs/src/content/api-reference.mdx`](./docs/src/content/api-reference.mdx). API guides live under `docs/src/content/api-guides/` (the old `/features` URLs redirect there).
- Editing public docs: follow `WARP.md` → Documentation DX conventions.

## Initial setup (agents)

**Goal:** Mongo + API + poller on Plume, then host product UI. Do **not** treat Docker app alone as “ready for wallet work.”

```bash
pnpm install
# Mongo + API + poller on Plume; registers the shared demo factory in Mongo.
# SKIP_APP=1 keeps :3000 free for the host UI.
REUSE_TAP_FACTORY=1 SKIP_APP=1 pnpm bootstrap
# Optional: NEXT_PUBLIC_OPERATOR_ADDRESS (an address, not a key) and PRIVATE_KEY
# (dev/demo only, for server-signed API). Use a dedicated env file for a factory-owner
# deploy key; never leave it in the always-on API env. Wallet UI does not need either.
# Wallet UI: install a browser extension wallet (Rabby, MetaMask, etc.) — no cloud key needed
pnpm app:dev                         # http://localhost:3000/app  (reads app/.env.local)
```

| Piece | Process |
| --- | --- |
| Mongo + API + poller | Docker via `pnpm bootstrap` / `docker compose up` |
| Mongo only | `pnpm docker:mongo` — **host port 27027** (not 27017). `restart: unless-stopped`. `docker compose stop` frees a port and leaves containers in place. |
| Product UI / wallet | Host `pnpm app:dev` + `app/.env.local` + browser extension wallet (EIP-6963, no cloud key) |
| Contract artifacts | `pnpm setup` → `chain/out` (required before server image build) |
| Factory in Mongo | `REUSE_TAP_FACTORY=1` (demo) or `pnpm deploy-factory` (you own it) |

### Factory mental model (do not confuse)

1. **Protocol builder** — ships BUSL contracts; owns the **shared demo** factory on Plume (`0xcd6…`, factory owner `0x366a…`). TAP Admin (product wallet) is `0x3601…`. Beacon upgrades for that demo deployment.
2. **Transfer-agent business** — deploys **their own** `CapTableFactory` (`pnpm deploy-factory`). That factory is their book of business (many issuer cap tables).
3. **Issuer ADMIN** — calls `createCapTable` on a factory (permissionless); becomes admin of **that** cap table. Wallet manage UI is this path. Using the shared factory ≠ owning it.
4. **Mongo `factories`** — local mirror only (`factory:register` / deploy auto-register). Not onchain ownership.

### Failure matrix (already hit in the wild)

| Symptom | Cause | Fix |
| --- | --- | --- |
| Turbopack `Can't resolve '@tap/units'` on `:3000` | Docker app image missing `packages/` **or** Docker owns port while host expects `app:dev` | Fixed in `docker/Dockerfile.app` (`COPY packages/`); or `docker compose stop app` + `pnpm app:dev` |
| No wallets in connect modal | No browser extension / EIP-6963 | Install Rabby / MetaMask (EIP-6963) — no cloud key or project id needed |
| `COPY chain/out` docker build fail | Artifacts missing | `pnpm setup` / `forge build --via-ir`; bootstrap now asserts non-empty `chain/out` |
| Fresh Mongo empty of companies | Poller only tracks registered issuers | Mint new company, or Load from wallet / register existing; not auto-import of all chain history |
| Stale factory impl in docs | Hardcoded old address | Always read impl onchain (`factory:register` does). After a demo beacon upgrade, update the landing demo table in `app/src/pages/index.tsx`. |
| Mint OK, register **500** | Docker app rewrites to `localhost:8293` | Docker: `NEXT_PUBLIC_API_URL=http://server:8293`; host app:dev: `localhost:8293` |
| Poller `0xUPDATE_ME` / invalid BytesLike | Placeholder PRIVATE_KEY | Real hex for server-signed; placeholder OK for read-only poller |
| TAP Mongo on 27017 / other app blocked | Old compose published default Mongo port with `restart: always` | Host port is **27027**. Host `DATABASE_URL` uses 27027. Inside compose, Mongo is still `mongodb:27017`. `docker compose stop` the container that holds the port, then `pnpm docker:mongo` if Mongo is not running. |
| `pnpm dev` or a server script stops with `Unable to locate .env` | No `.env` in the checkout (common in a fresh git worktree) | `cp .env.example .env` there, or set `DATABASE_URL` and `PORT` |
| A stakeholder or class from an older server's `/stakeholder/create` or `/stock-class/create` reverts with `NoStakeholder` / `InvalidStockClass` | Servers before the Oct 2026 audit fixes saved a random Mongo `_id` instead of the onchain id | Register it again with `/register-onchain` under its onchain id and delete the old record |

**Plume defaults:** `CHAIN_ID=98866`, `RPC_URL=https://rpc.plume.org`. Prefer mainnet for product work (not Anvil mint).

Bootstrap is idempotent — safe to re-run. Without `SKIP_APP=1` it also builds the Docker `next start` preview on :3000; run `docker compose stop app` before `pnpm app:dev`.

## Quick reminders

- Package manager is **pnpm** (pnpm workspace monorepo) — do not use `npm` or `yarn`.
- Never commit directly to `main`; branch from it and open a PR. PR titles follow Conventional Commits.
- end every task with a dated note in `memory/` and a commit (atomic groups, short lowercase messages, never on `main`). see `WARP.md` → git workflow.
- The blockchain is the source of truth; the offchain DB mirrors it via the event poller.
- Spell **onchain** / **offchain** in TAP contract comments (no hyphen). NatSpec on interfaces; `@inheritdoc` on implementations; no TODO/placeholder comments in `chain/src`.
- Onchain import helpers `mintSharesAuthorized` then `mintActivePositions` are one-shot (Foundry tests). Do not `issueStock` between them.
- Multi-lot `transferStock` salts ids with `issuanceOrdinal`. Partial repurchase `balance_security_id` is the remainder certificate (or zero), not the stakeholder id.
- Solidity stays **0.8.37** on feature PRs. A compiler bump is a **separate** PR (rebuild, storage-layout diff, new impl at new CREATE2 addresses, beacon upgrade, re-verify, landing demo addresses). Do not mix it with logic changes. Foundry v1.8.3 stable; no nightlies.
- Don't hand-edit `app/src/generated.ts` — regenerate with `pnpm --filter tap-app generate:wagmi`.
- Shared write-path units live in **`@tap/units`** (`packages/units`): 1e10 scaling, UUID↔bytes16, share-cap checks. Import from there in app and server; don't reintroduce local `scaleAmount` copies or ×10000 docs.
- **Product UI is `/app/*`** (Companies, New company, company workspace). Marketing is `/`. Legacy `/mint` and `/manage*` redirect to `/app`. Frontend dev = `pnpm app:dev`.
- Manage UI write path is **direct-wallet only** (`useDirect*` + `useOnchainAction`). Class/person metadata is saved through `/register-onchain` **after** a confirmed receipt. Issuance calls its `/register-onchain` endpoint **before** the wallet tx as validation only; the poller persists the canonical issuance. **Transfer** = `useDirectTransferStock` → `CapTable.transferStock`; poller mirrors TransferStock — do not call the server transfer API from the UI.
- Company nav: use real `issuerId` via `capTableHref` / `query.issuerId` — never link with a pathname that still contains `[issuerId]`.
- New factory deploys are CREATE2 (`pnpm deploy-factory`): address is salt + bytecode + owner, via the Arachnid deployer, not the deployer nonce. The shared Plume demo factory `0xcd6…` is the older CREATE deployment — do not replace its beacon or register a second factory over it. Upgrade that implementation with `./scripts/deployFactory.sh --upgrade-factory 0xcd6…`. Never hardcode impl addresses. `--verify` uses Sourcify because Plume Blockscout cannot compile Solidity 0.8.37 yet; opening the explorer address imports the Sourcify match. CLI/Mongo register is **local config**, not product onboarding.
- Invariant handler: `chain/test/invariants/CapTableHandler.sol`. It must exercise transfer / repurchase / cancel (and retract / reissue). Assert onchain counters, not unused `ghost_*` notebooks. The handler bounds inputs to the share caps the contract doesn't enforce; those contract gaps are listed on `docs/src/content/security.mdx` and need a decision before any beacon upgrade.
- Public docs: `docs/src/content` (path = URL, `_meta.js` per folder). Sections are `/development`, `/api-reference`, `/protocol`, `/api-guides`, `/security`, `/tests`. Keep Alex's pages (`index`, `development`, `factory-deploy`, `cap-table-deploy`) in his voice, keep poller coverage minimal, give each shared concept one home, and write runnable `curl` examples that pass OCF validation. Fix bugs found along the way on a separate branch and stack the docs PR on it; `api-reference.mdx` → Known issues is for what stays unfixed. Validate links, examples, redirects (`pnpm docs:build && pnpm docs:start`), and `pnpm --filter tap-docs lint` before a docs PR; Vercel builds no previews.
