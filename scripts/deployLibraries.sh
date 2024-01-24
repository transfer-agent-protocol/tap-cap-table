#!/bin/bash

TEMP=$PWD/chain/.env
cp .env $TEMP
trap "rm $TEMP" EXIT

set -x
cd chain
npx tsx ../src/scripts/deployAndLinkLibs.js
