#!/bin/bash
set -e

# Usage: ./scripts/bootstrap-plume.sh   (or: pnpm bootstrap)
#
# Idempotent setup for the TAP stack against Plume Mainnet (default path).
# Safe to re-run — every step checks current state before acting:
#   1. Ensure root .env exists (from .env.example)
#   2. Ensure app/.env.local exists (frontend reads this for pnpm app:dev)
#   3. pnpm install if node_modules is missing
#   4. Build contracts if chain/out is missing (server image COPYs them)
#   5. Assert chain/out has artifacts before docker build
#   6. Ensure external offchain-db Docker volume exists
#   7. Bring up mongodb + server (+ app) via docker compose
#   8. Wait for API health
#   9. Factory: never hardcode impl. Deploy your own (pnpm deploy-factory) or
#      REUSE_TAP_FACTORY=1 to register the shared demo factory (owner = TAP Admin).
#
# Overrides: API_URL, REUSE_TAP_FACTORY=1, SKIP_APP=1 (mongo+server only).
#
# Product UI: prefer host `pnpm app:dev` (reads app/.env.local). Docker app is
# optional; fix for @tap/units is in docker/Dockerfile.app (COPY packages/).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# Shared demo CapTableFactory on Plume (protocol-builder demo deployment).
# Factory owner (beacon upgrades) is TAP Admin 0x366a… — NOT your issuer wallet.
# createCapTable is permissionless; issuers mint cap tables through this factory
# without owning it. Licensed TAs should deploy their OWN factory instead.
TAP_FACTORY_ADDRESS="0xcd6Df14406b0569ceEABa884A18717774EdeaCA1"
API_URL="${API_URL:-http://localhost:8293}"

echo "🚀 TAP bootstrap (Plume)"
echo "========================"

# 1. Root .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env from .env.example — set RPC_URL/CHAIN_ID/PRIVATE_KEY and secrets for Plume."
else
    echo "✅ .env present"
fi

# Soft-nudge Plume defaults if still on Anvil placeholders (do not overwrite real keys)
if grep -q '^CHAIN_ID=31337' .env 2>/dev/null; then
    echo "ℹ️  .env still has CHAIN_ID=31337 (Anvil). For Plume Mainnet set CHAIN_ID=98866 and RPC_URL=https://rpc.plume.org"
fi

# 2. app/.env.local (required for host pnpm app:dev — Docker does not read this file)
if [ ! -f app/.env.local ]; then
    mkdir -p app
    cat > app/.env.local << 'APPEOF'
# Frontend (app/) — used by `pnpm app:dev`. Keep factory aligned with Mongo factories.
# Get a Reown project id at https://cloud.reown.com
NEXT_PUBLIC_REOWN_PROJECT_ID=UPDATE_ME
# Shared demo CapTableFactory on Plume (or your own after pnpm deploy-factory)
NEXT_PUBLIC_FACTORY_ADDRESS=0xcd6Df14406b0569ceEABa884A18717774EdeaCA1
NEXT_PUBLIC_CHAIN_ID=98866
NEXT_PUBLIC_API_URL=http://localhost:8293
# Address granted OPERATOR_ROLE on new cap tables (usually the server wallet from PRIVATE_KEY)
NEXT_PUBLIC_OPERATOR_ADDRESS=UPDATE_ME
APPEOF
    echo "📝 Created app/.env.local with Plume defaults — set REOWN + OPERATOR (and align factory if you deploy your own)."
else
    echo "✅ app/.env.local present"
fi

# 3. Dependencies
if [ ! -d node_modules ]; then
    echo "📦 node_modules missing — running pnpm install..."
    pnpm install
else
    echo "✅ node_modules present"
fi

# 4–5. Contracts (server image COPYs chain/out at build time)
if [ ! -d chain/out ]; then
    echo "⚒️  chain/out missing — building contracts (pnpm setup)..."
    pnpm setup
fi
# Assert artifacts actually exist (foundryup alone can leave out/ empty/missing)
if [ ! -d chain/out ] || [ -z "$(ls -A chain/out 2>/dev/null)" ]; then
    echo "❌ chain/out is missing or empty after setup. Run: cd chain && forge build --via-ir"
    exit 1
fi
echo "✅ chain/out present ($(ls chain/out | wc -l | tr -d ' ') artifact dirs)"

# 6. External volume (compose marks offchain-db external)
if ! docker volume inspect offchain-db >/dev/null 2>&1; then
    echo "📦 Creating external Docker volume offchain-db..."
    docker volume create offchain-db >/dev/null
else
    echo "✅ offchain-db volume present"
fi

# 7. Bring up the stack
if [ "${SKIP_APP:-0}" = "1" ]; then
    echo "🐳 Starting Docker stack (mongodb + server only; SKIP_APP=1)..."
    docker compose up -d --build mongodb server
else
    echo "🐳 Starting Docker stack (mongodb, server, app)..."
    docker compose up -d --build
fi

# 8. Wait for API health
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

# 9. Factory registration — never hardcode implementation. Deploy your own, or opt into demo reuse.
MONGO_CID="$(docker compose ps -q mongodb)"
if [ -z "$MONGO_CID" ]; then
    echo "❌ mongodb container not found"
    exit 1
fi
FACTORY_COUNT="$(docker exec "$MONGO_CID" mongosh "mongodb://tap:tap@localhost:27017/mongo?authSource=admin" --quiet --eval 'print(db.factories.countDocuments())' | tr -dc '0-9')"
if [ "${FACTORY_COUNT:-0}" -gt 0 ]; then
    echo "✅ Factory already registered in Mongo (count=$FACTORY_COUNT) — leaving as-is."
elif [ "${REUSE_TAP_FACTORY:-0}" = "1" ]; then
    echo "🌱 REUSE_TAP_FACTORY=1 — registering shared demo factory $TAP_FACTORY_ADDRESS (impl read onchain)..."
    echo "   Beacon upgrades stay with that factory's owner (TAP Admin / protocol builder)."
    echo "   This is the demo/issuer-dev path — not the same as owning a transfer-agent factory."
    pnpm factory:register --factory "$TAP_FACTORY_ADDRESS"
else
    echo "ℹ️  No factory registered yet."
    echo "   Transfer-agent / production path — deploy YOUR factory (you become owner):"
    echo "      pnpm deploy-factory          # CapTable + CapTableFactory + auto Mongo register"
    echo "   Then set NEXT_PUBLIC_FACTORY_ADDRESS in app/.env.local to the printed factory address."
    echo "   Demo/issuer-dev path — reuse TAP's shared Plume factory (owner is TAP Admin, not you):"
    echo "      REUSE_TAP_FACTORY=1 pnpm bootstrap"
fi

# Health / secrets checklist
echo ""
echo "========================"
echo "🎉 Bootstrap complete."
echo "  Server API:   $API_URL"
echo "  App (Docker): http://localhost:3000  (optional; needs real NEXT_PUBLIC_* from root .env)"
echo "  Product UI:   pnpm app:dev  →  http://localhost:3000/app  (reads app/.env.local)"
echo ""

SECRETS_OK=1
for f in .env app/.env.local; do
    if [ -f "$f" ] && grep -q 'UPDATE_ME' "$f" 2>/dev/null; then
        SECRETS_OK=0
    fi
done
if [ "$SECRETS_OK" -eq 0 ]; then
    echo "⚠️  Secrets still set to UPDATE_ME — product wallet UI will fail (Reown 403) until you set:"
    echo "      NEXT_PUBLIC_REOWN_PROJECT_ID   (https://cloud.reown.com) in app/.env.local and .env"
    echo "      NEXT_PUBLIC_OPERATOR_ADDRESS   (server wallet / operator for new cap tables)"
    echo "      PRIVATE_KEY                   (funded Plume key for server-signed paths / deploy-factory)"
else
    echo "✅ No UPDATE_ME placeholders detected in .env / app/.env.local"
fi

echo ""
echo "Mental model:"
echo "  Protocol builder — demo factory owner (beacon upgrades on shared 0xcd6…)"
echo "  Transfer agent   — deploys own CapTableFactory (pnpm deploy-factory)"
echo "  Issuer ADMIN     — createCapTable on a factory; wallet-first manage UI"
echo "  Mongo factories  — local mirror only (not onchain ownership)"
echo ""
echo "Existing onchain companies: use Load from wallet / GET /issuer/by-deployer — a fresh"
echo "Mongo will not auto-import historical issuers until they are registered or reindexed."
echo ""
echo "If the poller lags far behind head: pnpm poller:fast-forward --help"
echo ""
