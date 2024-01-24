#!/bin/bash

source .env

TEMP=$PWD/chain/.env
cp .env $TEMP
trap "rm $TEMP" EXIT

set -x
cd chain
forge script script/CapTableFactory.s.sol --broadcast --fork-url $RPC_URL
