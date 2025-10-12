#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
forge build 2>&1 | grep -E "(warning|note)\[" | sort | uniq -c | sort -rn
