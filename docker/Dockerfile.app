# Frontend (Next.js) development server
# Workspace package @tap/units lives in packages/ — must be copied or the
# pnpm workspace symlink is dangling and Turbopack fails with
# "Module not found: Can't resolve '@tap/units'".
FROM node:24-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace root + app + shared packages
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY app/ ./app/

# Install app workspace (pulls @tap/units via workspace:*)
RUN pnpm install --filter tap-app... --frozen-lockfile

WORKDIR /app/app

# Inlined at `next build`. Compose passes docker-network values (API = http://server:8293).
ARG NEXT_PUBLIC_API_URL=http://localhost:8293
ARG NEXT_PUBLIC_FACTORY_ADDRESS
ARG NEXT_PUBLIC_CHAIN_ID=98866
ARG NEXT_PUBLIC_OPERATOR_ADDRESS
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FACTORY_ADDRESS=$NEXT_PUBLIC_FACTORY_ADDRESS
ENV NEXT_PUBLIC_CHAIN_ID=$NEXT_PUBLIC_CHAIN_ID
ENV NEXT_PUBLIC_OPERATOR_ADDRESS=$NEXT_PUBLIC_OPERATOR_ADDRESS

RUN pnpm build

EXPOSE 3000

# `next start` — no webpack/turbopack file watcher (polling that on a bind mount pegged ~8 cores).
# Hot reload stays on the host: pnpm app:dev.
CMD ["pnpm", "start", "--hostname", "0.0.0.0"]
