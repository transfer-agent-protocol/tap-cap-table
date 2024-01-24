#!/bin/bash

TEMP=$PWD/chain/.env
cp .env $TEMP
trap "rm $TEMP"

set -x
cd chain
npx tsx ../src/scripts/deployAndLinkLibs.js
