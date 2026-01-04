# Developer documentation for the Transfer Agent Protocol

Developer docs for the [Transfer Agent Protocol Cap Table](https://github.com/transfer-agent-protocol/tap-cap-table) that are published at [docs.transferagentprotocol.xyz](https://docs.transferagentprotocol.xyz).

## Development

The docs are part of the tap-cap-table monorepo. From the repository root:

```bash
# Install all dependencies
pnpm install

# Run docs dev server
pnpm docs:dev
```

Or from this directory:

```bash
pnpm dev
```

## Deployment

The docs are deployed to [docs.transferagentprotocol.xyz](https://docs.transferagentprotocol.xyz) using [Vercel](https://vercel.com/). To deploy, open a PR to `main` to start a review. Once the PR is merged, the docs will be deployed automatically.
