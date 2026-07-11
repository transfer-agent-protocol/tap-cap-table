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

```bash
pnpm install
pnpm setup
cp .env.example .env        # Edit with your keys (see below)
pnpm docker:up              # Start MongoDB, server, and app
```

This spins up three services via Docker:

| Service | URL |
|---------|-----|
| **Server** | http://localhost:8293 |
| **App** | http://localhost:3000 — marketing `/` + product `/app/*` |
| **MongoDB** | localhost:27017 |

**Product UI** (`pnpm app:dev` for hot reload):

- `/app/companies` — companies you’ve minted / loaded from wallet
- `/app/mint` — create a company (cap table) from the connected admin wallet
- `/app/companies/[issuerId]` — holdings, stock classes, shareholders, issue stock, **transfer**, transactions

Legacy `/mint` and `/manage*` redirect into `/app`.

Then go read official [docs](https://docs.transferagentprotocol.xyz/)

> **Environment**: Copy `.env.example` to `.env` and fill in `PRIVATE_KEY`, `RPC_URL`, `CHAIN_ID`, and the `NEXT_PUBLIC_*` variables for the frontend (including `NEXT_PUBLIC_REOWN_PROJECT_ID` from [cloud.reown.com](https://cloud.reown.com) for wallet connection). Align `NEXT_PUBLIC_FACTORY_ADDRESS` in `app/.env.local` with the Mongo `factories` collection. For Plume Mainnet, set `CHAIN_ID=98866` and `RPC_URL=https://rpc.plume.org`.

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

This project uses a multi-license structure:

- **Core Protocol** (`chain/`): [BUSL-1.1](LICENSE) (converts to AGPLv3 on January 1, 2028)
- **API Server** (`server/`): [AGPL-3.0](server/LICENSE)
- **Frontend** (`app/`): Proprietary
- **Documentation** (`docs/`): MIT

For enterprise licensing inquiries, please contact the owner of this repo.
