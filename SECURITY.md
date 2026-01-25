# Security

## Reporting Security Issues

If you discover a security vulnerability in this project, please report it by emailing the project maintainers. Please do not create public GitHub issues for security vulnerabilities.

## Known Issues

### Dependencies in OCF Submodule

The `ocf/` directory is a git submodule maintained by the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF).

As of the latest audit, there are known vulnerabilities in the OCF submodule's dependencies:

- **Critical (1)**: parse-url SSRF vulnerability (in documentation dependencies)
- **High (3)**: parse-path, braces, ansi-html vulnerabilities (in documentation dependencies)
- **Moderate (6)**: Various ReDoS and XSS vulnerabilities (in documentation/tooling dependencies)
- **Low (1)**: tmp vulnerability (in development dependencies)

**Impact**: These vulnerabilities are in the OCF documentation generation tooling and do not affect runtime code. They are not used in production deployments of this cap table implementation.

**Mitigation**:

- The ocf submodule is only used for schema validation and sample data
- None of the vulnerable packages are part of the runtime API server or smart contracts
- Updates to the OCF submodule will be applied when the upstream project addresses these issues

### Direct Dependencies

We actively monitor and update our direct dependencies for security vulnerabilities. Run `pnpm audit` to see the current status.

## Security Best Practices

When deploying this application:

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Private Keys**: Store blockchain private keys securely (e.g., using secret managers)
3. **Database**: Use MongoDB with authentication enabled and restrict network access
4. **RPC Endpoints**: Use authenticated RPC endpoints for blockchain access
5. **HTTPS**: Always use HTTPS in production
6. **Updates**: Keep dependencies updated regularly

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Toolchain

We use a multi-layered approach to smart contract security:

### Static Analysis

| Tool | Purpose | Output |
|------|---------|--------|
| [Aderyn](https://github.com/Cyfrin/aderyn) | Fast linting, IDE integration | `report.md` |
| [Slither](https://github.com/crytic/slither) | Deep semantic analysis, taint tracking | `chain/slither-report.md` |

### Dynamic Analysis

| Tool | Purpose | Location |
|------|---------|----------|
| Foundry Invariant Tests | Stateful fuzzing, property-based testing | `chain/test/invariants/` |

### Running Security Checks

```bash
# Run all security tools
make security

# Individual tools
make aderyn
make slither
make test-invariant
```

### CI Integration

Security checks run automatically on every PR via GitHub Actions (`.github/workflows/security.yml`):
- Slither analysis with SARIF upload to GitHub Security tab
- Invariant test suite

### Local Setup

**Aderyn** (Rust):
```bash
cargo install aderyn
```

**Slither** (Python 3.10+):
```bash
pip install slither-analyzer
```

### Pre-Audit Checklist

Before external audits:
1. Run `make security` and address all high/medium findings
2. Run `make test-invariant-deep` for extended fuzzing
3. Review `report.md` and `chain/slither-report.md`
4. Ensure all tests pass: `make test`

## Security Features

- MongoDB transactions support for atomic operations
- OCF schema validation on all API inputs
- Smart contract access control (RBAC)
- Event-driven architecture with blockchain as source of truth
