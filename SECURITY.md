# Security Policy

## Reporting a vulnerability

Email security@palmer.earth. Do not open a public GitHub issue.

Include the component (contracts, API, app, or workflows), what you observed, and the impact. This project is not in production. There is no bug bounty and no response-time commitment. Reports against the default branch are the ones we can act on.

## Scope

In scope:

- Contracts in `chain/src` (cap table, factory, and the libraries in this repo)
- The API and event poller in `server/`
- The product app in `app/`
- Workflows in `.github/workflows`

Out of scope:

- Vendored contracts in `chain/lib` (OpenZeppelin, forge-std). Report those upstream.
- The `ocf/` submodule. Report schema issues upstream.
- Plume, browser wallets, and public RPC providers.
- The local Docker setup. The development database uses published development credentials, and the API does not authenticate callers. That is the local stack, not a production deployment. A report is in scope when the same behavior would matter for a hosted API, a hosted app, or a deployed contract.

## Supported versions

No release is supported. There is no production version line. `1.0.0` in `package.json` is not a supported release.

## What we run

- Pull requests to `main` run the Node and Foundry checks. Both are required to merge, along with one approving review.
- Changes under `chain/` also run Foundry invariant tests. That job is not required to merge.
- Dependabot opens update requests for the root pnpm lockfile and for GitHub Actions. Dependabot security updates are on.
- Secret scanning and push protection are on.
- This repository does not run a Solidity static analyzer.

## Before this is production

- Do not commit `.env` files or private keys.
- Do not put the API or the development database on the public internet.
- Product writes are signed by the connected wallet. The chain is the record. The database is a copy.
