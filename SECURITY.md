# Security

## Reporting Security Issues

If you discover a security vulnerability in this project, please report it by emailing the project maintainers. Please do not create public GitHub issues for security vulnerabilities.

## Monorepo dependency surfaces

GitHub Dependabot and GitHub Actions only read **root** `.github/` (`dependabot.yml`, `workflows/`). Nested `.github/` folders under `app/`, `docs/`, `server/`, or `chain/` are ignored. Package-specific conventions live here and in `WARP.md` / `app/WARP.md`.

| Surface | Manifest | What to patch | What not to do |
| --- | --- | --- | --- |
| API + poller | root `package.json` | Direct runtime deps (`mongoose`, `express` 4.x, `uuid`, `ethers`) and their transitives | Do not jump Express 5 without a dedicated migration. Do not add unused compilers. |
| Product UI | `app/package.json` | `next` / `react` / `wagmi` / `viem` (same Next major as docs) | Do not hand-edit `app/src/generated.ts`. |
| Docs | `docs/package.json` | `nextra` + the same `next` major as the app | Docs is App Router (Nextra 4). Do not reintroduce Pages Router. |
| Contracts | Foundry (`chain/`) | Aderyn + invariant tests | Not an npm ecosystem. Do not install Slither. |
| OCF schemas | `ocf/` git submodule | JSON schemas only (imported as files) | Not a pnpm workspace. Upstream docs/jest deps must not enter `pnpm-lock.yaml`. |

Dependabot scans the **root** npm lockfile weekly (production and development groups) plus GitHub Actions monthly. Ignore Express major upgrades.

## Direct Dependencies

We actively monitor and update our direct dependencies for security vulnerabilities. Run `pnpm audit` to see the current status.

Unused packages that only existed to generate alerts (`solc`, `date-fns`, OCF npm workspace membership) were removed rather than patched.

## Security Best Practices

When deploying this application:

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Private Keys**: Store blockchain private keys securely (e.g., using secret managers)
3. **Database**: Use MongoDB with authentication enabled and restrict network access
4. **RPC Endpoints**: Use authenticated RPC endpoints for blockchain access
5. **HTTPS**: Always use HTTPS in production
6. **Updates**: Keep dependencies updated regularly
7. **Secret scanning**: Enable GitHub secret scanning + push protection on the repository (Settings → Code security). It is not configurable from workflow YAML.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Toolchain

We use a multi-layered approach to smart contract security:

### Static Analysis

| Tool | Purpose | Output |
|------|---------|--------|
| [Aderyn](https://github.com/Cyfrin/aderyn) | Fast linting, IDE integration | `report.md` (re-run after contract changes; must include `chain/src/lib/`) |

Slither was removed. Low-severity reentrancy SARIF on `CapTableFactory` (event after `new BeaconProxy`, state write after `upgradeTo`) was noise; Aderyn plus Foundry invariants are the replacement until a better semantic analyzer is chosen.

### Dynamic Analysis

| Tool | Purpose | Location |
|------|---------|----------|
| Foundry Invariant Tests | Stateful fuzzing, property-based testing | `chain/test/invariants/` |
| Foundry unit tests | Access control, factory, accounting | `chain/test/` (`make test`) |

### Running Security Checks

```bash
# Static analysis
make security

# Individual tools
make aderyn
make test-invariant
```

### CI Integration

- Node lint / typecheck / `@tap/units` and Foundry unit tests: `.github/workflows/ci.yml`
- Invariant tests on Solidity changes: `.github/workflows/security.yml`

### Local Setup

**Aderyn** (Rust):
```bash
cargo install aderyn
```

### Pre-Audit Checklist

Before external audits:
1. Run `make security` and address all high/medium findings
2. Run `make test-invariant-deep` for extended fuzzing
3. Review `report.md`
4. Ensure all tests pass: `make test`

## Security Features

- MongoDB transactions support for atomic operations
- OCF schema validation on all API inputs
- Smart contract access control (RBAC)
- Event-driven architecture with blockchain as source of truth
