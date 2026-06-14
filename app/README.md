# TAP Frontend

Next.js frontend for the [Transfer Agent Protocol](https://transferagentprotocol.xyz). It serves the public landing page and a wallet-based dApp for minting and managing onchain cap tables:

- `/mint` — deploy a new cap table from the connected admin wallet
- `/manage` — list and manage cap tables your wallet has deployed

## Development

```bash
# From monorepo root
pnpm app:dev

# Or from this directory
pnpm dev

# Regenerate contract hooks (src/generated.ts) after a chain ABI change
pnpm generate:wagmi
```

## Tech Stack

- Next.js 16 (Pages Router), React 19
- styled-components v6
- wagmi + viem + Reown AppKit (wallet connection)
- TanStack Query (data fetching)
- IBM Plex Mono font

See [`WARP.md`](./WARP.md) for frontend conventions and the root [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
