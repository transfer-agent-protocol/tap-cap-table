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
# Wallet UI: browser extension + NEXT_PUBLIC_* in app/.env.local. Server PRIVATE_KEY optional
pnpm app:dev                         # Product UI — http://localhost:3000/app
```

| Service | URL |
|---------|-----|
| **Server** | http://localhost:8293 |
| **App (host)** | http://localhost:3000 — use `pnpm app:dev` for wallet work (`app/.env.local`) |
| **MongoDB** | localhost:27027 (not 27017) |

`pnpm bootstrap` is idempotent. Prefer host `pnpm app:dev` for the product UI; Docker app is optional.

### Wallet connection (native)

The product UI uses a **first-party connect modal** (TAP design system) on top of **wagmi + EIP-6963** browser wallets (Rabby, MetaMask, etc.). No third-party connect-cloud account is required for extension wallets.


**Product UI**

- `/app/companies` — companies you’ve minted / loaded from wallet
- `/app/mint` — create a company (cap table) from the connected admin wallet
- `/app/companies/[issuerId]` — holdings, stock classes, shareholders, issue stock, **transfer**, transactions

Legacy `/mint` and `/manage*` redirect into `/app`.

**Who owns what (short):** protocol builder owns the shared **demo** factory on Plume; a licensed transfer agent should deploy **their own** factory (`pnpm deploy-factory`); issuers mint **cap tables** through a factory (wallet UI) and become ADMIN of that table. Mongo `factories` is a local mirror only. Factory owner ≠ issuer ADMIN ≠ server `PRIVATE_KEY` — see [Three wallets / keys](https://docs.transferagentprotocol.xyz/development/setup#three-wallets-keys).

Then go read official [docs](https://docs.transferagentprotocol.xyz)

> **Environment**: `.env.example` defaults to Plume Mainnet (`CHAIN_ID=98866`, `RPC_URL=https://rpc.plume.org`). Copy to `.env` **and** put the same `NEXT_PUBLIC_*` values in `app/.env.local` for `pnpm app:dev`. Wallets: install a browser extension (no cloud project id required). Set `NEXT_PUBLIC_OPERATOR_ADDRESS` (address only). `PRIVATE_KEY` is **dev/demo only** and optional for the wallet UI (needed for server-signed API / CLI factory deploy). Align `NEXT_PUBLIC_FACTORY_ADDRESS` with Mongo `factories`.

### Scripts

```bash
# Docker (MongoDB, server, app)
pnpm docker:up              # Start all services
pnpm docker:mongo           # Mongo only (host 27027)
pnpm docker:down            # Stop and remove containers (frees 27027)
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

