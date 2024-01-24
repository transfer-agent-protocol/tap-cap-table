#!/bin/bash
set -x

source .env
cd chain
forge script script/CapTableFactory.s.sol --broadcast --fork-url $RPC_URL
