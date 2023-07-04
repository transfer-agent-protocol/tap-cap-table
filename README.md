# Transfer Agent Protocol (TAP) Specification for a compliant cap table

This scafforld scaffold is based on [Open Cap Table Coalition](https://github.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF) primitives. It's meant to be a starting point for a compliant cap table. At this stage, it's a work in progress.

## Initial setup

1. Copy`.env.example` to `.env` like this

```sh
cp .env.example .env
```

> Do not delete `.env.example`. It's useful for future contributors as a reference.

2. **Install Docker** [for your OS](https://docs.docker.com/get-docker/). We use Docker to start the local development database.

3. **Install dependencies** with `yarn`:

```sh
yarn
```

3. **Start the local development database** with `docker compose`:

```sh
docker compose up
```

4. **Migrate the local development database** to the base schema:

```sh
yarn prisma:migrate
```

5. **Run either your preferred table tool - like [Postico](https://eggerapps.at/postico2/), [TablePlus](https://tableplus.com/) - or the natively provided Prisma Studio** to inspect your local development database.

```sh
yarn prisma:studio
```

6. **Run `yarn seed` to seed the database with some initial data**:

```sh
yarn seed
```