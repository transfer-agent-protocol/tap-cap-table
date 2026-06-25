#!/bin/bash
set -e

# Usage: ./scripts/bootstrap-plume.sh   (or: pnpm bootstrap)
#
# Idempotent, one-command setup for the full TAP stack against Plume Mainnet.
# Safe to re-run — every step checks current state before acting:
#   1. Ensure a root .env exists (copied from .env.example if missing)
#   2. Build contracts if chain/out is missing (the server image COPYs them)
#   3. Ensure the external `offchain-db` Docker volume exists (compose marks it external)
#   4. Bring up the Docker stack (mongodb, server, app)
#   5. Wait for the API health endpoint
#   6. Check the Mongo `factories` collection. We never hardcode/seed a factory: a transfer-agent
#      operator deploys their OWN factory (pnpm deploy-factory, which auto-registers it). If none
#      is registered, this prints guidance. Set REUSE_TAP_FACTORY=1 to register an existing Plume
#      factory (implementation read onchain); only reuse a factory whose owner wallet you control.
#
# Overrides: API_URL, REUSE_TAP_FACTORY=1.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# Reuse-only: an existing CapTableFactory on Plume. Used ONLY when REUSE_TAP_FACTORY=1.
# By default this script does NOT register any factory — deploy your own with `pnpm deploy-factory`
# (which auto-registers it). The implementation is read from the factory onchain, never hardcoded.
# NOTE: the factory's owner (the wallet that deployed it) controls beacon upgrades for all its cap
# tables — only reuse a factory whose owner wallet you control.
TAP_FACTORY_ADDRESS="0xcd6Df14406b0569ceEABa884A18717774EdeaCA1"
API_URL="${API_URL:-http://localhost:8293}"

echo "🚀 TAP bootstrap (Plume)"
echo "========================"

# 1. Root .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env from .env.example — set RPC_URL/CHAIN_ID/PRIVATE_KEY for Plume before deploying."
else
    echo "✅ .env present"
fi

# 2. Contracts (the server image COPYs chain/out at build time)
if [ ! -d chain/out ]; then
    echo "⚒️  chain/out missing — building contracts (pnpm setup)..."
    pnpm setup
else
    echo "✅ chain/out present"
fi

# 3. External volume footgun (compose declares offchain-db as external)
if ! docker volume inspect offchain-db >/dev/null 2>&1; then
    echo "📦 Creating external Docker volume offchain-db..."
    docker volume create offchain-db >/dev/null
else
    echo "✅ offchain-db volume present"
fi

# 4. Bring up the stack
echo "🐳 Starting Docker stack (mongodb, server, app)..."
docker compose up -d --build

# 5. Wait for API health
printf "⏳ Waiting for API at %s " "$API_URL"
for i in $(seq 1 60); do
    if curl -fsS "$API_URL/" >/dev/null 2>&1; then
        echo "— up"
        break
    fi
    printf "."
    sleep 2
    if [ "$i" -eq 60 ]; then
        echo " timed out"
        echo "❌ API did not become healthy. Check: pnpm docker:logs"
        exit 1
    fi
done

# 6. Factory registration — never hardcode. Deploy your own, or explicitly opt into reuse.
MONGO_CID="$(docker compose ps -q mongodb)"
if [ -z "$MONGO_CID" ]; then
    echo "❌ mongodb container not found"
    exit 1
fi
FACTORY_COUNT="$(docker exec "$MONGO_CID" mongosh "mongodb://tap:tap@localhost:27017/mongo?authSource=admin" --quiet --eval 'print(db.factories.countDocuments())' | tr -dc '0-9')"
if [ "${FACTORY_COUNT:-0}" -gt 0 ]; then
    echo "✅ Factory already registered in Mongo (count=$FACTORY_COUNT) — leaving as-is."
elif [ "${REUSE_TAP_FACTORY:-0}" = "1" ]; then
    echo "🌱 REUSE_TAP_FACTORY=1 — registering existing Plume factory $TAP_FACTORY_ADDRESS (impl read onchain)..."
    echo "   (Beacon-upgrade control stays with that factory's owner wallet — only reuse one you control.)"
    pnpm factory:register --factory "$TAP_FACTORY_ADDRESS"
else
    echo "ℹ️  No factory registered yet. As a transfer-agent operator, deploy your OWN factory:"
    echo "      pnpm deploy-factory          # deploys CapTable + CapTableFactory and registers them in Mongo"
    echo "   Or register an existing factory you control:"
    echo "      pnpm factory:register --factory 0x... --implementation 0x..."
    echo "   (Dev convenience — reuse TAP's shared Plume factory: REUSE_TAP_FACTORY=1 pnpm bootstrap)"
fi

echo ""
echo "========================"
echo "🎉 Bootstrap complete."
echo "  Server API:   $API_URL"
echo "  App (Docker): http://localhost:3000  (landing page)"
echo "  Wallet mint/manage UI: run 'pnpm app:dev' (reads app/.env.local), then open http://localhost:3000/mint"
echo ""
echo "Once a factory is registered (see above), deploy the first cap table with the server wallet:"
echo "  curl -X POST $API_URL/issuer/create -H 'Content-Type: application/json' -d @your-issuer.json"
echo ""
echo "If the poller's block number stalls or lags far behind head, fast-forward the index:"
echo "  pnpm poller:fast-forward            # all issuers -> chain head"
echo "  pnpm poller:fast-forward --help     # options"
echo ""
