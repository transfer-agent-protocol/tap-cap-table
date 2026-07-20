# TAP Frontend

Next.js frontend for the [Transfer Agent Protocol](https://transferagentprotocol.xyz). Marketing landing plus a wallet product for minting and managing onchain cap tables.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing (docs / GitHub / demo contracts; no wallet) |
| `/app/companies` | Companies list |
| `/app/mint` | Create a company (deploy cap table) |
| `/app/companies/[issuerId]?view=` | Cap table: holdings, stock classes, shareholders, issue, transfer, transactions |
| `/mint`, `/manage/*` | Legacy redirects → `/app/*` |

Manage writes are **direct-wallet only** (`useDirect*` + `useOnchainAction`); chain is source of truth; poller mirrors to Mongo. Stock transfer uses existing `CapTable.transferStock` / TransferStock poller path.

## Development

```bash
# From monorepo root
pnpm app:dev

# Or from this directory
pnpm dev

# Unit tests (nav, ownership model, activity log helpers)
pnpm test:nav

# Regenerate contract hooks (src/generated.ts) after a chain ABI change
pnpm generate:wagmi
```

## Tech Stack

- Next.js 16 (Pages Router), React 19
- styled-components v6
- wagmi + viem + native wallet modal (EIP-6963 / optional WalletConnect)
- TanStack Query (data fetching)
- IBM Plex Mono font
- `@tap/units` (1e10 scaling, UUID↔bytes16, share caps)

See [`WARP.md`](./WARP.md) for frontend conventions and the root [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
