# Frontend (Next.js) development server
# Workspace package @tap/units lives in packages/ — must be copied or the
# pnpm workspace symlink is dangling and Turbopack fails with
# "Module not found: Can't resolve '@tap/units'".
FROM node:20-slim

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

EXPOSE 3000

# NEXT_PUBLIC_* must be provided at runtime via docker-compose (or build args
# for production images). Browser API rewrite should use a host-reachable URL
# such as http://localhost:8293 — not the compose DNS name "server".
CMD ["pnpm", "dev"]
