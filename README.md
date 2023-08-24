# Transfer Agent Protocol (TAP) Specification for a compliant cap table onchain

This scaffold is based on the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard, with the license included in its entirety. In development, it's meant to be run in a Docker container with a local MongoDB instance.

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

Install dependencies and setup [Foundry](https://book.getfoundry.sh/) and `forge` with our setup script:

```sh
yarn install && yarn setup
```

## Running the cap table

Docker compose should have started the database. Once that's running, start the server with nodemon:

```sh
yarn start
```

Innspect the database with Mongo Compass. To connect to it, use the same string that we provided in the `.env` file:

```sh
mongodb://tap:tap@localhost:27017/mongo?authSource=admin&retryWrites=true&w=majority
```

## Running Anvil

This repo is onchain first. We use [Anvil](https://book.getfoundry.sh/anvil/) to run the local blockchain and deploy our cap table smart contracts. At all times, you should have a local node running alongside Docker and nodemon.

With the cap table instance running in Docker, and nodemon running the server, you can start Anvil.

In the `chain` directory, run:

```sh
anvil
```

## Seeding the cap table with sample data

We provide sample data to test the cap table. You can inspect and change it in [/src/db/samples/notPoet](./src/db/samples/notPoet/). We provide you with a [Manifest.ocf.json](./src/db/samples/notPoet/Manifest.ocf.json) file with [Poet's](https://poet.network) actual cap table (some data is obviously fake). You can change it to your own startup if you want to test it.

To seed the database, you'll need to run [Postman](https://www.postman.com/downloads/) and POST to this route:

```sh
http://localhost:3000/add-poet-manifest-mint-cap-table
```

If you ever need to deseed the database, we provide a script that leaves the models and wipes the data:

```sh
yarn deseed
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
