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
#   - Start the Plume stack: REUSE_TAP_FACTORY=1 SKIP_APP=1 pnpm bootstrap
#   - Start the host product UI: pnpm app:dev

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
    echo "   ℹ️  PRIVATE_KEY may stay as UPDATE_ME for the wallet-first UI/read-only poller"
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
echo "  1. Start the Plume stack: REUSE_TAP_FACTORY=1 SKIP_APP=1 pnpm bootstrap"
echo "  2. Start the product UI:  pnpm app:dev"
echo ""
echo "Use the Anvil alternate only when explicitly testing local-chain behavior;"
echo "the default development and deployment target is Plume Mainnet."
echo ""
