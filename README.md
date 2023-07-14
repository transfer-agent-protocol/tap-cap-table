# Transfer Agent Protocol (TAP) Specification for a compliant cap table

This scafforld is based on the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard, with the license included in its entirety. In development, it's meant to be run in a Docker container with a local MongoDB instance. Before you start, **Install Docker** [for your OS](https://docs.docker.com/get-docker/).

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

4. **Start the local development database** with `docker compose`:

```sh
docker compose up
```

5. **Push the local schema** to the Mongo instance running inside of Docker:

```sh
yarn prisma db push
```

6. **Run either your preferred table tool - like [TablePlus](https://tableplus.com/) - or the natively provided Prisma Studio** to inspect your local development database.

```sh
yarn prisma:studio
```

7. **Run `yarn seed` to seed the database with some initial data**:

```sh
yarn seed
```