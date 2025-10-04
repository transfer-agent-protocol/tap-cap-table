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

## Security Features

- MongoDB transactions support for atomic operations
- OCF schema validation on all API inputs
- Smart contract access control (RBAC)
- Event-driven architecture with blockchain as source of truth
