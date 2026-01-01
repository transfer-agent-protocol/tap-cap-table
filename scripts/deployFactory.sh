#!/bin/bash
set -e

# Usage: ./scripts/deployFactory.sh [env_file] [--verify]
# Examples:
#   ./scripts/deployFactory.sh                    # Deploy using .env
#   ./scripts/deployFactory.sh --verify           # Deploy using .env with verification
#   ./scripts/deployFactory.sh .env.prod          # Deploy using .env.prod
#   ./scripts/deployFactory.sh .env.prod --verify # Deploy using .env.prod with verification
#
# This script deploys:
#   1. DeleteContext library
#   2. Adjustment library
#   3. StockLib library
#   4. CapTable implementation contract
#   5. CapTableFactory (constructor takes CapTable address)
#
# After deployment, add the factory to MongoDB to use the API.

# Parse arguments
USE_ENV_FILE=".env"
VERIFY=false

for arg in "$@"; do
    if [ "$arg" = "--verify" ]; then
        VERIFY=true
    elif [ -f "$arg" ]; then
        USE_ENV_FILE="$arg"
    fi
done

echo "📋 Loading environment from $USE_ENV_FILE"
source $USE_ENV_FILE

# Validate required env vars
if [ -z "$RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: RPC_URL and PRIVATE_KEY must be set in $USE_ENV_FILE"
    exit 1
fi

# Set up verification flags for Plume (Blockscout)
VERIFY_FLAGS=""
if [ "$VERIFY" = true ]; then
    if [ "$CHAIN_ID" = "98866" ]; then
        VERIFIER_URL="https://explorer.plume.org/api/"
    elif [ "$CHAIN_ID" = "98867" ]; then
        VERIFIER_URL="https://testnet-explorer.plume.org/api/"
    else
        echo "⚠️  Warning: Verification only supported for Plume (chain 98866/98867). Skipping verification."
        VERIFY=false
    fi
    
    if [ "$VERIFY" = true ]; then
        VERIFY_FLAGS="--verify --verifier blockscout --verifier-url $VERIFIER_URL"
        echo "✅ Verification enabled using Blockscout at $VERIFIER_URL"
    fi
fi

# Common flags for forge create
# --legacy is required for Plume and other non-EIP-1559 chains
# ETH_RPC_URL is used because --rpc-url can be overridden by foundry.toml
export ETH_RPC_URL="$RPC_URL"
COMMON_FLAGS="--private-key $PRIVATE_KEY --broadcast --legacy $VERIFY_FLAGS"

cd chain

echo ""
echo "🚀 Deploying CapTable + CapTableFactory"
echo "   RPC: $RPC_URL"
echo ""

# Helper function to extract deployed address from forge create output
extract_address() {
    grep "Deployed to:" | awk '{print $3}'
}

# 1. Deploy DeleteContext library
echo "📦 [1/5] Deploying DeleteContext library..."
DELETE_CONTEXT_OUTPUT=$(forge create src/lib/DeleteContext.sol:DeleteContext $COMMON_FLAGS 2>&1)
echo "$DELETE_CONTEXT_OUTPUT"
DELETE_CONTEXT_ADDR=$(echo "$DELETE_CONTEXT_OUTPUT" | extract_address)
if [ -z "$DELETE_CONTEXT_ADDR" ]; then
    echo "❌ Failed to deploy DeleteContext"
    exit 1
fi
echo "✅ DeleteContext deployed at: $DELETE_CONTEXT_ADDR"
echo ""

# 2. Deploy Adjustment library
echo "📦 [2/5] Deploying Adjustment library..."
ADJUSTMENT_OUTPUT=$(forge create src/lib/transactions/Adjustment.sol:Adjustment $COMMON_FLAGS 2>&1)
echo "$ADJUSTMENT_OUTPUT"
ADJUSTMENT_ADDR=$(echo "$ADJUSTMENT_OUTPUT" | extract_address)
if [ -z "$ADJUSTMENT_ADDR" ]; then
    echo "❌ Failed to deploy Adjustment"
    exit 1
fi
echo "✅ Adjustment deployed at: $ADJUSTMENT_ADDR"
echo ""

# 3. Deploy StockLib library (links DeleteContext)
echo "📦 [3/5] Deploying StockLib library..."
STOCK_LIB_OUTPUT=$(forge create src/lib/Stock.sol:StockLib \
    --libraries src/lib/DeleteContext.sol:DeleteContext:$DELETE_CONTEXT_ADDR \
    $COMMON_FLAGS 2>&1)
echo "$STOCK_LIB_OUTPUT"
STOCK_LIB_ADDR=$(echo "$STOCK_LIB_OUTPUT" | extract_address)
if [ -z "$STOCK_LIB_ADDR" ]; then
    echo "❌ Failed to deploy StockLib"
    exit 1
fi
echo "✅ StockLib deployed at: $STOCK_LIB_ADDR"
echo ""

# 4. Deploy CapTable implementation (links StockLib + Adjustment)
echo "📦 [4/5] Deploying CapTable implementation..."
CAP_TABLE_OUTPUT=$(forge create src/CapTable.sol:CapTable \
    --libraries src/lib/Stock.sol:StockLib:$STOCK_LIB_ADDR \
    --libraries src/lib/transactions/Adjustment.sol:Adjustment:$ADJUSTMENT_ADDR \
    $COMMON_FLAGS 2>&1)
echo "$CAP_TABLE_OUTPUT"
CAP_TABLE_ADDR=$(echo "$CAP_TABLE_OUTPUT" | extract_address)
if [ -z "$CAP_TABLE_ADDR" ]; then
    echo "❌ Failed to deploy CapTable"
    exit 1
fi
echo "✅ CapTable deployed at: $CAP_TABLE_ADDR"
echo ""

# 5. Deploy CapTableFactory (constructor takes CapTable address)
# Note: Using --constructor-args-path because --constructor-args conflicts with --private-key in forge
echo "📦 [5/5] Deploying CapTableFactory..."
echo "$CAP_TABLE_ADDR" > /tmp/factory-constructor-args.txt
FACTORY_OUTPUT=$(forge create src/CapTableFactory.sol:CapTableFactory \
    --constructor-args-path /tmp/factory-constructor-args.txt \
    $COMMON_FLAGS 2>&1)
rm -f /tmp/factory-constructor-args.txt
echo "$FACTORY_OUTPUT"
FACTORY_ADDR=$(echo "$FACTORY_OUTPUT" | extract_address)
if [ -z "$FACTORY_ADDR" ]; then
    echo "❌ Failed to deploy CapTableFactory"
    exit 1
fi
echo "✅ CapTableFactory deployed at: $FACTORY_ADDR"
echo ""

# Summary
echo "========================================"
echo "🎉 Deployment Complete!"
echo "========================================"
echo "CapTable (implementation): $CAP_TABLE_ADDR"
echo "CapTableFactory:           $FACTORY_ADDR"
echo "========================================"
echo ""
echo "Add to MongoDB factories collection:"
echo "{"
echo "  \"implementation_address\": \"$CAP_TABLE_ADDR\","
echo "  \"factory_address\": \"$FACTORY_ADDR\""
echo "}"
