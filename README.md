# Transfer Agent Protocol (TAP) Specification for a compliant cap table onchain

This scaffold is based on the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard, with the license included in its entirety. In development, it's meant to be run in a Docker container with a local MongoDB instance.

Before you start, [Install Docker](https://docs.docker.com/get-docker/) and [Mongo Compass](https://www.mongodb.com/try/download/compass). You'll need both to run the local development database and inspect it.

We're using the official [MongoDB Docker image](https://hub.docker.com/_/mongo) for the local development database. You can find the [Docker Compose file](./docker-compose.yml) in the root of this repository.

## Official links

- [Contributor doc](https://coda.io/d/_drhpwRhDok-/Transfer-Agent-Protocol_sua17) - to read about the project and how to contribute.
- [Slack](https://transferagentprotocol.slack.com/) - invite only for now.

## Getting started

**Clone the repository** with OCF and forge included as submodules:

```sh
git clone --recurse-submodules https://github.com/poet-network/tap-cap-table.git
```

## Initial setup

Copy `.env.example` to `.env`, which gives you a DB connection string. You can change the values in the `.env` file, but the defaults should work for local development.

```sh
cp .env.example .env
```

Pull the official Mongo image, and run the local development database with `docker compose`:

```sh
docker compose up
```

Install dependencies and setup [Foundry](https://book.getfoundry.sh/) and `forge` with our setup script:

```sh
yarn install && yarn setup
```

## Running the cap table

Docker compose should have started the database. Now you can start the server with:

```sh
yarn start
```

Install and run [Mongo Compass](https://www.mongodb.com/try/download/compass)  to inspect the database. You can find the connection string in the `.env` file:

```sh
mongodb://tap:tap@localhost:27017/mongo?authSource=admin&retryWrites=true&w=majority
```

## Seeding the cap table with sample data

We provide sample data to test the cap table. You can inspect and change it in [/src/db/samples/notPoet](./src/db/samples/notPoet/). We provide you with a [Manifest.ocf.json](./src/db/samples/notPoet/Manifest.ocf.json) file with [Poet's](https://poet.network) our actual cap table, but some data is fake. You can change it to your own startup if you want to test it.

To seed the database, you'll need to run [Postman](https://www.postman.com/downloads/) and POST to this route:

```sh
http://localhost:3000/add-not-poet-to-db
```

If you ever need to deseed the database, we provide a script that leaves the models and wipes the data:

```sh
yarn deseed
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
