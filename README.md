<div align="center">
  <a href="https://github.com/transfer-agent-protocol/tap-cap-table/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-BUSL--1.1-blue">
  </a>
</div>

# Transfer Agent Protocol (TAP) Cap Table

An onchain cap table implementation combining Solidity smart contracts with an off-chain Node.js API server. Implements the [Open Cap Table Coalition (OCF)](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard.

Read official docs at [https://docs.transferagentprotocol.xyz](https://docs.transferagentprotocol.xyz/).

## Structure

This is a **pnpm monorepo**:

```
tap-cap-table/
├── app/             # Next.js frontend (landing + /app product workspace)
├── server/          # Express API server + event poller
├── chain/           # Solidity smart contracts (Foundry)
├── docs/            # Nextra documentation site
├── packages/units/  # @tap/units — shared 1e10 scale / UUID / share-caps
└── ocf/             # OCF standard (git submodule)
```

## Quick Start

**Plume-first (recommended):**

```bash
pnpm install
REUSE_TAP_FACTORY=1 pnpm bootstrap   # Mongo + API (+ optional Docker app), demo factory in Mongo
# Required: set NEXT_PUBLIC_REOWN_PROJECT_ID (see below) + OPERATOR / PRIVATE_KEY as needed
pnpm app:dev                         # Product UI — http://localhost:3000/app
```

| Service | URL |
|---------|-----|
| **Server** | http://localhost:8293 |
| **App (host)** | http://localhost:3000 — use `pnpm app:dev` for wallet work (`app/.env.local`) |
| **MongoDB** | localhost:27017 |

`pnpm bootstrap` is idempotent. Prefer host `pnpm app:dev` for the product UI; Docker app is optional.

### Reown project ID (required for wallet UI)

The product UI uses **Reown AppKit** for connect-wallet. Without a real project id the app will not connect wallets (and used to hard-crash with HTTP **403** from `api.web3modal.org`).

1. Create a project at [cloud.reown.com](https://cloud.reown.com)
2. Set the same value in **both** files:
   - `app/.env.local` → `NEXT_PUBLIC_REOWN_PROJECT_ID=...` (required for `pnpm app:dev`)
   - root `.env` → same key (used if you run the Docker app)
3. Restart the frontend after changing it (`pnpm app:dev`, or rebuild Docker app)

Do **not** leave `UPDATE_ME` or an empty value. A custom wallet-connect stack (no Reown account) is planned separately — for now Reown is required.

**Product UI**

- `/app/companies` — companies you’ve minted / loaded from wallet
- `/app/mint` — create a company (cap table) from the connected admin wallet
- `/app/companies/[issuerId]` — holdings, stock classes, shareholders, issue stock, **transfer**, transactions

Legacy `/mint` and `/manage*` redirect into `/app`.

**Who owns what (short):** protocol builder owns the shared **demo** factory on Plume; a licensed transfer agent should deploy **their own** factory (`pnpm deploy-factory`); issuers mint **cap tables** through a factory (wallet UI) and become ADMIN of that table. Mongo `factories` is a local mirror only.

Then go read official [docs](https://docs.transferagentprotocol.xyz/)

> **Environment**: `.env.example` defaults to Plume Mainnet (`CHAIN_ID=98866`, `RPC_URL=https://rpc.plume.org`). Copy to `.env` **and** put the same `NEXT_PUBLIC_*` values in `app/.env.local` for `pnpm app:dev`. **Required for wallets:** `NEXT_PUBLIC_REOWN_PROJECT_ID` from [cloud.reown.com](https://cloud.reown.com). Also set `NEXT_PUBLIC_OPERATOR_ADDRESS`, and `PRIVATE_KEY` for server-signed paths / factory deploy. Align `NEXT_PUBLIC_FACTORY_ADDRESS` with Mongo `factories`.

### Scripts

```bash
# Docker (runs all services: MongoDB, server, app)
pnpm docker:up              # Start all services
pnpm docker:down            # Stop all services
pnpm docker:logs            # Stream logs
pnpm docker:build           # Rebuild and start

# Local development (hot-reload; prefer this over Docker for app/server code changes)
pnpm dev                    # API server (+ poller)
pnpm app:dev                # Frontend (reads app/.env.local)
pnpm docs:dev               # Docs site
pnpm test:units             # Shared @tap/units tests
```

## Development

For AI-assisted / agent development, see:

- [`WARP.md`](./WARP.md) — monorepo architecture, commands, patterns, pitfalls
- [`app/WARP.md`](./app/WARP.md) — frontend conventions (routes, write path, styled-components)
- [`AGENTS.md`](./AGENTS.md) / [`CLAUDE.md`](./CLAUDE.md) — short pointers to those files
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — branch and PR conventions

## Contributing

We welcome all contributions. Please give a quick read to our [CONTRIBUTING](./CONTRIBUTING.md) guidelines before submitting new PRs!

## License

This repository is licensed under the **Business Source License 1.1** ([LICENSE](LICENSE)) — PALMER.EARTH CORP.

- Change Date: January 1, 2028
- Change License: AGPL-3.0 or later

Third-party dependencies and the `ocf/` git submodule retain their own licenses. For alternative licensing, contact alex@palmer.earth.

