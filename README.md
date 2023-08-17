# Transfer Agent Protocol (TAP) Specification for a compliant cap table

This scafforld is based on the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard, with the license included in its entirety. In development, it's meant to be run in a Docker container with a local MongoDB instance.

Before you start, **Install Docker** [for your OS](https://docs.docker.com/get-docker/) and [Mongo Compass](https://www.mongodb.com/try/download/compass). You'll need both to run the local development database and inspect it.

We're using the official [MongoDB Docker image](https://hub.docker.com/_/mongo) for the local development database. You can find the Docker Compose file in the root of this repository.

## Getting started

1. **Clone the repository** with OCF included as a submodule as a submodule:

```sh
git clone --recurse-submodules https://github.com/poet-network/tap-cap-table.git
```

## Initial setup to run the cap table

2. Copy`.env.example` to `.env`.

```sh
cp .env.example .env
```

3. **Install dependencies** with `yarn`:

```sh
yarn
```

4. **Pull the oficial Mongo image, and run the local development database** with `docker compose`:

```sh
docker compose up
```

5. **Optionally, push the local schema** to the Mongo instance running inside of Docker:

```sh
yarn seed
```

This script currently uses Manifest.ocf.json inside of our src/db/samples/notPoet folder.

6. **Run [Mongo Compass](https://www.mongodb.com/try/download/compass) or your preferred table tool - like [TablePlus](https://tableplus.com/) - to inspect the database**. You can find the connection string in the `.env` file:

```sh
mongodb://tap:tap@localhost:27017/mongo?authSource=admin&retryWrites=true&w=majority
```

7. **If you ever need to deseed the databse, we provide a script that leaves the models and wipes the data**:

```sh
yarn deseed
```