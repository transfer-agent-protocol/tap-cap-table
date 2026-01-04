#!/bin/bash
set -e

# Usage: ./scripts/dev.sh [options]
#
# Options:
#   --build       Force rebuild of Docker images
#   --mongo-only  Start only MongoDB
#   --no-app      Start MongoDB and server, skip frontend app
#   --no-server   Start MongoDB and app only (run server locally with 'pnpm dev')
#   --down        Stop all services
#   -h, --help    Show this help message
#
# Examples:
#   ./scripts/dev.sh              # Start all services (MongoDB, server, app)
#   ./scripts/dev.sh --build      # Rebuild images and start all services
#   ./scripts/dev.sh --mongo-only # Start only MongoDB
#   ./scripts/dev.sh --no-app     # Start MongoDB and server only
#   ./scripts/dev.sh --no-server  # Start MongoDB and app (run server locally)
#   ./scripts/dev.sh --down       # Stop all services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

# Parse arguments
BUILD_FLAG=""
MONGO_ONLY=false
NO_APP=false
NO_SERVER=false
DOWN=false

for arg in "$@"; do
    case $arg in
        --build)
            BUILD_FLAG="--build"
            ;;
        --mongo-only)
            MONGO_ONLY=true
            ;;
        --no-app)
            NO_APP=true
            ;;
        --no-server)
            NO_SERVER=true
            ;;
        --down)
            DOWN=true
            ;;
        -h|--help)
            head -21 "$0" | tail -19
            exit 0
            ;;
    esac
done

# Handle --down
if [ "$DOWN" = true ]; then
    echo "🛑 Stopping all services..."
    docker compose down
    exit 0
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please update .env with your PRIVATE_KEY (get from 'anvil' output)"
    echo ""
fi

# Handle --mongo-only (use existing docker-compose.yml)
if [ "$MONGO_ONLY" = true ]; then
    echo "🍃 Starting MongoDB only..."
    docker compose up -d
    echo "✅ MongoDB running on port 27017"
    exit 0
fi

# Check if anvil is needed
if ! grep -q "PRIVATE_KEY=0x" .env 2>/dev/null; then
    echo ""
    echo "💡 Tip: Start anvil in another terminal and copy a private key to .env"
    echo "   Run: anvil"
    echo ""
fi

# Handle --no-app
if [ "$NO_APP" = true ]; then
    echo "🚀 Starting MongoDB and server..."
    docker compose up $BUILD_FLAG mongodb server
    exit 0
fi

# Handle --no-server (for local server development with hot-reload)
if [ "$NO_SERVER" = true ]; then
    echo "🚀 Starting MongoDB and app (run server locally with 'pnpm dev')..."
    echo "   MongoDB: http://localhost:27017"
    echo "   App:     http://localhost:3000"
    echo ""
    echo "💡 Run 'pnpm dev' in another terminal to start the server"
    echo ""
    docker compose up $BUILD_FLAG mongodb app
    exit 0
fi

# Start all services
echo "🚀 Starting all services (MongoDB, server, app)..."
echo "   MongoDB: http://localhost:27017"
echo "   Server:  http://localhost:8293"
echo "   App:     http://localhost:3000"
echo ""
docker compose up $BUILD_FLAG
