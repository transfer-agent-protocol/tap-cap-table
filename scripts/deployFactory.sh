#!/bin/bash

# Accept a single argument of an env file to use. By default use .env at root
USE_ENV_FILE=${1:-.env}

source $USE_ENV_FILE

# Copy the root .env underneath chain so we dont have to maintain two copies
TEMP=$PWD/chain/.env
cp $USE_ENV_FILE $TEMP
trap "rm $TEMP" EXIT

set -x
cd chain
forge script script/CapTableFactory.s.sol:DeployCapTableFactoryDeployLocalScript --broadcast --fork-url $RPC_URL
