# TAP Cap Table - Frontend App
FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/ ./app/

# Install dependencies (app workspace only)
RUN pnpm install --filter tap-app --frozen-lockfile

WORKDIR /app/app

EXPOSE 3000

# Run Next.js dev server
CMD ["pnpm", "dev"]
