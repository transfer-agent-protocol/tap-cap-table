#!/bin/bash
set -e

# Usage: ./scripts/setup.sh
#
# First-time setup script for TAP Cap Table development.
# This script:
#   1. Initializes git submodules (OCF)
#   2. Creates .env from .env.example if needed
#   3. Installs pnpm dependencies
#   4. Sets up Foundry and builds contracts
#
# After running this script:
#   - Start MongoDB: docker compose up -d
#   - Start Anvil:   anvil (in separate terminal)
#   - Copy a private key from anvil output to .env
#   - Run server:    pnpm dev
#
# Or use Docker for everything: ./scripts/dev.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "🔧 TAP Cap Table - First-time Setup"
echo "===================================="
echo ""

# 1. Git submodules
echo "📦 [1/4] Initializing git submodules..."
git submodule update --init --recursive
echo "✅ Submodules initialized"
echo ""

# 2. Environment file
echo "📝 [2/4] Checking environment file..."
if [ -f .env ]; then
    echo "✅ .env already exists"
else
    cp .env.example .env
    echo "✅ Created .env from .env.example"
    echo "   ⚠️  Remember to update PRIVATE_KEY after starting anvil"
fi
echo ""

# 3. Install dependencies
echo "📥 [3/4] Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# 4. Foundry setup
echo "⚒️  [4/4] Setting up Foundry and building contracts..."
pnpm setup
echo "✅ Contracts built"
echo ""

echo "===================================="
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start MongoDB:  docker compose up -d"
echo "  2. Start Anvil:    anvil  (in new terminal)"
echo "  3. Copy a private key from anvil to .env"
echo "  4. Run server:     pnpm dev"
echo ""
echo "Or start everything with Docker:"
echo "  ./scripts/dev.sh"
echo ""
