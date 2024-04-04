<div align="center">
  <a href="https://github.com/transfer-agent-protocol/tap-cap-table/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/transfer-agent-protocol/tap-cap-table">
  </a>
</div>

# Documentation

Read official docs at [https://docs.transferagentprotocol.xyz](https://docs.transferagentprotocol.xyz/) to get started.

This repo is based on the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard, with the license included in its entirety.

## Contributing

We welcome all contributions. Please give a quick read to our [CONTRIBUTING](./CONTRIBUTING.md) guidelines to understand the them and the process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## OUTDATED README BELOW
---
## Running the cap table server

After the deployment script is completed, start the server with nodemon:

```sh
yarn dev
```

Inspect the database with Mongo Compass. To connect to it, use the same string that we provided in the `.env` file:

```sh
mongodb://tap:tap@localhost:27017/mongo?authSource=admin&retryWrites=true&w=majority
```

## Seeding and deploying the cap table with sample data

There are two ways of seeding the cap table:

### Using the manifest file

We provide sample data to test deploying the cap table onchain. You can inspect and change it in [/src/db/samples/notPoet](./src/db/samples/notPoet/), which contains [Manifest.ocf.json](./src/db/samples/notPoet/Manifest.ocf.json) file with [Poet's](https://poet.network) actual cap table, and some partial data in primary objects (stakeholders, stock classes, vesting terms, valuation, etc).

You can change it to your own startup if you want to test it.

To seed the database, you'll need to

1. Run [Postman](https://www.postman.com/downloads/)
2. Run `yarn export-manifest` which will zip the sample manifest file inside of /samples and save it to your /Downloads directory.
3. POST that ZIP file to the `http://localhost:8080/mint-cap-table` route in Postman as a form-data request with that file attached.

This operation will perform several checks. If everything is in order, it will deploy the cap table onchain, and seed the database with the sample data.

1. Check if the cap table is already deployed onchain. If it is, it will return an error
2. Validate schema against [OCF](../ocf/schema/objects/). If it isn't, it will return an error
3. Check if the cap table is already in the database. If it is, it will return an error
4. Mint the cap table onchain if all checks pass, then save it to the Mongo DB instance.

In development and testing, you will need to deseed the database before you can seed it again. To do that, run:

```sh
yarn deseed
```

### Using sample scripts that call our APIs

In another terminal (ensuring you’re in the root directory) run `node src/scripts/testMintingCapTable.js.` If you navigate to `/scripts` directory, you’ll be able to interact with the sample data.

## Debugging Steps

We're shipping code fast. If you run into an issue, particularly one that results in an onchain error of "could not estimate gas", it's likely that the forge build cache is out of sync.

Inside of `/chain`:

-   Restart anvil
-   Run `forge clean`
-   Move back to the root directory, then run `yarn deploy-libraries`

After, you can seed and deploy the cap table with either of the above options. If the bug persists, please open an issue with an attached screenshot and steps to reproduce.

## Testing Web3

Run all smart contracts tests

`yarn test`

## Testing Web2

### Unit tests

Run all javascript unit tests with jest

`yarn test-js`

### Integration tests

Deploy a cap table to local anvil server through a local web2 server. The chain event listener is also run to ensure the events are properly mirrored into the mongo database. NOTE: running this deletes your local mongo collections first

`yarn test-js-integration`

Integration test setup from no active processes:

-   Terminal 1: `docker compose up`
-   Terminal 2: `anvil`
-   Terminal 3:
    -   `USE_ENV_FILE=.env.test.local yarn deploy-factory`
    -   `yarn test-js-integration`
