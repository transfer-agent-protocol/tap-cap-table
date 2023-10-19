# Transfer Agent Protocol (TAP) Specification for a compliant cap table onchain

Developed by:

- [Poet](https://poet.network/)
- [Plural Energy](https://www.pluralenergy.co/)
- [Fairmint](https://www.fairmint.com/)

This repo is based on the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard, with the license included in its entirety. In development, it's meant to be run in a Docker container with a local MongoDB instance. While in active development, it's meant to be run with [Anvil](https://book.getfoundry.sh/anvil/) and [Forge](https://book.getfoundry.sh/forge/).

<div align="center">
  <a href="https://github.com/poet-network/tap-cap-table/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/poet-network/tap-cap-table">
  </a>
</div>

## Dependencies

- [Docker](https://docs.docker.com/get-docker/)

- [Foundry](https://getfoundry.sh/)

```sh
curl -L https://foundry.paradigm.xyz | bash
```

- [Mongo Compass](https://www.mongodb.com/try/download/compass)

- [Postman App](https://www.postman.com/downloads/)

- [Node.js v18.16.0](https://nodejs.org/en/download/)

- [Yarn v1.22.19](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

We're using the official [MongoDB Docker image](https://hub.docker.com/_/mongo) for the local development database. You can find the [Docker Compose file](./docker-compose.yml) in the root of this repository.

## Official links

- [Contributor doc](https://coda.io/d/_drhpwRhDok-/Transfer-Agent-Protocol_sua17) - to read about the project and how to contribute.
- [Slack](https://transferagentprotocol.slack.com/) - invite only for now.

## Getting started

Ensure you have all dependencies setup. Clone the repository with OCF and Forge included as submodules:

```sh
git clone --recurse-submodules https://github.com/poet-network/tap-cap-table.git
```

## Initial setup

Our `.env.example` files are setup for local development with Docker and Foundry. You'll need to copy them to `.env` and update the values with your own. If you're a contributor working with us, you will get those values from our Bitwarden vault.

Copy `.env.example` to `.env` in the root of the project.

```sh
cd tap-cap-table && cp .env.example .env
```

Copy `.env.example` to `.env` inside of the `chain` folder.

```sh
cd chain && cp .env.example .env
```

In the root folder, pull the official Mongo image, and run the local development database with `docker compose`:

```sh
docker compose up
```

## Running Anvil

This repo is onchain first. We use [Anvil](https://book.getfoundry.sh/anvil/) to run the local blockchain and deploy our cap table smart contracts. At all times, you should have Anvil running alongside Docker and nodemon.

With the mongo DB running on Docker you can start Anvil.

In the `chain` directory, run:

```sh
anvil
```

Install dependencies and setup [Foundry](https://book.getfoundry.sh/) and `forge` with our setup script:

```sh
yarn install && yarn setup
```

## Deploying external libraries

In our architecture, each transaction is mapped to an external library, which ensures bytecode limits are never met.

In order to deploy these libraries, ensure you have anvil running. Then `run yarn build` inside of the root directory.

This might take a couple of minutes, since each library is being deployed one at a time using a dependency graph that's generated with the command.


## Running the cap table server

After the deployment script is completed, start the server with nodemon:

```sh
yarn start
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
2. ZIP the [samples/notPoet](./src/db/samples/notPoet/) folder
3. POST that ZIP file to the `http://localhost:8080/mint-cap-table` route in Postman as a form-data request with that file attached.

This operation will perform several checks. If everything is in order, it will deploy the cap table onchain, and seed the database with the sample data.

1. Check if the cap table is already deployed onchain. If it is, it will return an error
2. Validate schema against [OCF](../ocf/schema/objects/), returned an error if it isn't valid
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

- restart anvil
- run `forge clean`
- move back to the root directory, then run `yarn build`

After, you can seed and deploy the cap table with either of the above options. If the bug persists, please open an issue with an attached screenshot and steps to reproduce.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
