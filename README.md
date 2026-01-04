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
├── app/        # Next.js frontend
├── server/     # Express API server
├── chain/      # Solidity smart contracts (Foundry)
├── docs/       # Nextra documentation site
└── ocf/        # OCF standard (git submodule)
```

## Quick Start

```bash
pnpm install
pnpm setup
pnpm docker:up
pnpm dev
```

The setup script spins up these services:
**Server** http://localhost:8293
**App** http://localhost:3000 
**MongoDB** localhost:27017

Then go read official [docs](https://docs.transferagentprotocol.xyz/)

> You'll need to run local blockchain using `anvil` in Foundry and copy a private key to `.env`. For Plume, set `RPC_URL` and `CHAIN_ID`.

### Scripts

```bash
# Docker
pnpm docker:up              # Start all services
pnpm docker:down            # Stop all services
pnpm docker:logs            # Stream logs
pnpm docker:build           # Rebuild and start

# Development
pnpm dev                    # API server (run locally for hot-reload)
pnpm app:dev                # Frontend only
pnpm docs:dev               # Docs site

# Hybrid (run server locally for hot-reload)
./scripts/dev.sh --no-server   # MongoDB + app in Docker, then run 'pnpm dev'
```

## Development

For developers using [Warp](https://warp.dev), see [`WARP.md`](./WARP.md) for AI-assisted development guidance.

## Contributing

We welcome all contributions. Please give a quick read to our [CONTRIBUTING](./CONTRIBUTING.md) guidelines before submitting new PRs!

## License

This project uses a multi-license structure:

- **Core Protocol** (`chain/`): [BUSL-1.1](LICENSE) (converts to AGPLv3 on January 1, 2028)
- **API Server** (`server/`): [AGPL-3.0](LICENSE-AGPL)
- **Frontend** (`app/`): Proprietary
- **Documentation** (`docs/`): MIT

For enterprise licensing inquiries, please contact the owner of this repo.
