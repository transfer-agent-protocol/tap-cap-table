#!/bin/bash
set -e

# Usage: ./scripts/deployFactory.sh [env_file] [--verify] [--no-register] [--upgrade-factory 0x...]
#
# New factory (CREATE2 libraries, implementation, factory; beacon is CREATE2 from the factory):
#   ./scripts/deployFactory.sh
#   ./scripts/deployFactory.sh .env.prod --verify
#
# --verify submits source to Sourcify. Visit the Plume explorer address afterward
# to trigger Blockscout's automatic import of the Sourcify match.
#
# Point an existing factory's beacon at the CREATE2 implementation. Does not deploy a second factory.
#   ./scripts/deployFactory.sh --upgrade-factory 0xYourFactory
#
# Addresses come from the deploy output. Same owner + salt + bytecode => same address on every
# chain that has the Arachnid deployer (0x4e59b44847b379578588920cA78FbF26c0B4956C).

USE_ENV_FILE=".env"
VERIFY=false
NO_REGISTER=false
UPGRADE_FACTORY=""

args=("$@")
i=0
while [ "$i" -lt "${#args[@]}" ]; do
    arg="${args[$i]}"
    if [ "$arg" = "--verify" ]; then
        VERIFY=true
    elif [ "$arg" = "--no-register" ]; then
        NO_REGISTER=true
    elif [ "$arg" = "--upgrade-factory" ]; then
        i=$((i + 1))
        UPGRADE_FACTORY="${args[$i]:-}"
    elif [ -f "$arg" ]; then
        USE_ENV_FILE="$arg"
    else
        echo "Unknown argument: $arg"
        exit 1
    fi
    i=$((i + 1))
done

echo "Loading environment from $USE_ENV_FILE"
CLEAN_ENV="$(mktemp)"
python3 - "$USE_ENV_FILE" "$CLEAN_ENV" << 'PY'
import pathlib, re, shlex, sys
src, dest = sys.argv[1], sys.argv[2]
lines = []
for raw in pathlib.Path(src).read_text().splitlines():
    line = raw.split("#", 1)[0].strip().strip("\u2502").strip()
    if "=" not in line:
        continue
    key, val = line.split("=", 1)
    key = key.strip()
    val = val.strip().strip("\u2502").strip().strip('"').strip("'")
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", key):
        continue
    lines.append(f"export {key}={shlex.quote(val)}")
pathlib.Path(dest).write_text("\n".join(lines) + "\n")
PY
set -a
# shellcheck disable=SC1090
source "$CLEAN_ENV"
set +a
rm -f "$CLEAN_ENV"

if [ -z "$RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Error: RPC_URL and PRIVATE_KEY must be set in $USE_ENV_FILE"
    exit 1
fi

if [ -n "$UPGRADE_FACTORY" ] && ! [[ "$UPGRADE_FACTORY" =~ ^0x[0-9a-fA-F]{40}$ ]]; then
    echo "Error: --upgrade-factory must be a 0x address"
    exit 1
fi

VERIFY_FLAGS=()
if [ "$VERIFY" = true ]; then
    VERIFY_FLAGS=(--verify --verifier sourcify)
    echo "Verification enabled using Sourcify"
fi

export ETH_RPC_URL="$RPC_URL"
export PRIVATE_KEY
if [ -n "$UPGRADE_FACTORY" ]; then
    export FACTORY_ADDRESS="$UPGRADE_FACTORY"
    SCRIPT_CONTRACT="script/DeployFactory.s.sol:UpgradeCapTableImplementation"
    echo "Upgrading existing factory $UPGRADE_FACTORY (no new factory)"
else
    SCRIPT_CONTRACT="script/DeployFactory.s.sol:DeployFactory"
    echo "Deploying a new CREATE2 factory"
fi

ROOT_DIR="$(pwd)"
cd chain

echo ""
echo "Running forge script ($SCRIPT_CONTRACT)"
echo "   RPC: $RPC_URL"
echo ""

LOG_FILE="$(mktemp)"
FOUNDRY_PROFILE=deploy forge script "$SCRIPT_CONTRACT" \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --legacy \
    --color never \
    "${VERIFY_FLAGS[@]}" | tee "$LOG_FILE"

extract() {
    awk -v key="$1" '$1 == key { print $NF }' "$LOG_FILE" | tail -1
}

CAP_TABLE_ADDR="$(extract TAP_DEPLOY_IMPLEMENTATION)"
FACTORY_ADDR="$(extract TAP_DEPLOY_FACTORY)"
BEACON_ADDR="$(extract TAP_DEPLOY_BEACON)"
rm -f "$LOG_FILE"

if [ -z "$CAP_TABLE_ADDR" ] || [ -z "$FACTORY_ADDR" ] || [ -z "$BEACON_ADDR" ]; then
    echo "Failed to parse deploy addresses from forge script output"
    exit 1
fi

cd "$ROOT_DIR"
python3 - "$FACTORY_ADDR" << 'PY'
import json, pathlib, sys
files = sorted(pathlib.Path("chain/broadcast").glob("**/run-latest.json"), key=lambda p: p.stat().st_mtime, reverse=True)
files = [p for p in files if "dry-run" not in p.parts]
if not files:
    sys.exit("no forge broadcast file")
data = json.loads(files[0].read_text())
names = set()
for tx in data.get("transactions", []):
    if tx.get("contractName"):
        names.add(tx["contractName"])
for lib in data.get("libraries", []) or []:
    parts = lib.split(":")
    if len(parts) >= 2:
        names.add(parts[-2])
missing = {"DeleteContext", "Adjustment", "StockLib"} - names
print(f"broadcast {files[0]}")
print("contracts " + ", ".join(sorted(names)))
if missing:
    sys.exit("missing CREATE2 library deploys: " + ", ".join(sorted(missing)))
PY

echo ""
echo "========================================"
echo "Deployment complete"
echo "========================================"
echo "CapTable (implementation): $CAP_TABLE_ADDR"
echo "CapTableFactory:           $FACTORY_ADDR"
echo "Beacon:                    $BEACON_ADDR"
echo "========================================"
echo ""
if [ "$VERIFY" = true ]; then
    echo "Sourcify verification submitted."
    echo "Visit each contract on the Plume explorer to trigger its automatic Sourcify import."
    echo ""
fi

if [ "$NO_REGISTER" = true ]; then
    echo "Skipping DB registration (--no-register)."
    if [ -n "$UPGRADE_FACTORY" ]; then
        echo "  pnpm factory:register --factory $UPGRADE_FACTORY"
    else
        echo "  pnpm factory:register --factory $FACTORY_ADDR --implementation $CAP_TABLE_ADDR"
    fi
    exit 0
fi

if [ -n "$UPGRADE_FACTORY" ]; then
    echo "Refreshing the existing factory in Mongo (address unchanged)..."
    pnpm factory:register --factory "$UPGRADE_FACTORY" --implementation "$CAP_TABLE_ADDR"
else
    echo "Registering the new factory in Mongo..."
    pnpm factory:register --factory "$FACTORY_ADDR" --implementation "$CAP_TABLE_ADDR"
fi
