<div align="center">
  <a href="https://github.com/transfer-agent-protocol/tap-cap-table/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/transfer-agent-protocol/tap-cap-table">
  </a>
</div>

# Documentation

Read official docs at [https://docs.transferagentprotocol.xyz](https://docs.transferagentprotocol.xyz/) to get started.

The documentation source lives in the [`docs/`](./docs) directory and can be run locally with `pnpm docs:dev`.

This repo is based on the [Open Cap Table Coalition](https://github.com/transfer-agent-protocol/tap-ocf) standard, with the license included in its entirety.

## Development

For developers using [Warp](https://warp.dev), see [`WARP.md`](./WARP.md) for AI-assisted development guidance.

## Contributing

We welcome all contributions. Please give a quick read to our [CONTRIBUTING](./CONTRIBUTING.md) guidelines before submiting new PRs!

## License

This project uses a dual-license structure:

- **Core Protocol (Smart Contracts)**: The Solidity contracts in `chain/` are licensed under the [Business Source License 1.1](LICENSE) (BUSL-1.1). This temporarily restricts commercial use until January 1, 2028, after which the code converts to AGPLv3.

- **Offchain Server**: Offchain architecture and code in `src/` is licensed under the [GNU Affero General Public License v3.0](LICENSE-AGPL) (AGPL-3.0). This requires source sharing for network services.

- **Documentation**: The documentation in `docs/` is licensed under the MIT License.

For enterprise licensing inquiries, please contact the owner of this repo.
