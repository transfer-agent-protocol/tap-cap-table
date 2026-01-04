<div align="center">
  <a href="https://github.com/transfer-agent-protocol/tap-cap-table/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/transfer-agent-protocol/tap-cap-table">
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
# Install dependencies
pnpm install

# Setup Foundry and build contracts
pnpm setup

# Start MongoDB
docker-compose up -d

# Configure environment
cp .env.example .env
```

## Running Services

```bash
# API server (development)
pnpm dev

# Frontend app
pnpm app:dev

# Documentation site
pnpm docs:dev
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
