# Transfer Agent Protocol (TAP) Specification for a compliant cap table

This scafforld is based on the [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) standard, with the license included in its entirety. In development, it's meant to be run in a Docker container with a local MongoDB instance. Before you start, **Install Docker** [for your OS](https://docs.docker.com/get-docker/).

## Initial setup to run the cap table

1. Copy`.env.example` to `.env`.

```sh
cp .env.example .env
```

2. **Install dependencies** with `yarn`:

```sh
yarn
```

3. **Start the local development database** with `docker compose`:

```sh
docker compose up
```

4. **Push the local schema** to the Mongo instance running inside of Docker:

```sh
yarn prisma db push
```

5. **Run either your preferred table tool - like [TablePlus](https://tableplus.com/) - or the natively provided Prisma Studio** to inspect your local development database.

```sh
yarn prisma:studio
```

6. **Run `yarn seed` to seed the database with some initial data**:

```sh
yarn seed
```