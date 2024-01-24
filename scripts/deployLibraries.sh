#!/bin/bash
set -x

cd chain
npx tsx ../src/scripts/deployAndLinkLibs.js
