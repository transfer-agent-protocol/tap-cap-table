# Use the official node image as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# Install curl and git
RUN apt-get update && apt-get install -y git

# Install foundry
RUN curl -L https://foundry.paradigm.xyz | bash

# Update the PATH to include the foundryup binary
ENV PATH="/root/.foundry/bin:${PATH}"

# Clone the git repository
RUN git clone --recurse-submodules --depth 1 https://github.com/poet-network/tap-cap-table.git .

# Copy .env.example to .env in the root of the project
RUN cp .env.example .env

# Copy .env.example to .env inside of the chain folder
RUN cd chain && cp .env.example .env && cd ..

# Replace placeholders in .env
RUN sed -i "s/OPTIMISM_GOERLI_RPC_URL=UPDATE_ME/OPTIMISM_GOERLI_RPC_URL=${OPTIMISM_GOERLI_RPC_URL}/g" .env
RUN sed -i "s/PRIVATE_KEY_FAKE_ACCOUNT=UPDATE_ME/PRIVATE_KEY_FAKE_ACCOUNT=${PRIVATE_KEY_FAKE_ACCOUNT}/g" .env
RUN sed -i "s/PRIVATE_KEY_POET_TEST=UPDATE_ME/PRIVATE_KEY_POET_TEST=${PRIVATE_KEY_POET_TEST}/g" .env
RUN sed -i "s/OPTIMISM_GOERLI_RPC_URL=UPDATE_ME/OPTIMISM_GOERLI_RPC_URL=${OPTIMISM_GOERLI_RPC_URL}/g" chain/.env
RUN sed -i "s/PRIVATE_KEY_FAKE_ACCOUNT=UPDATE_ME/PRIVATE_KEY_FAKE_ACCOUNT=${PRIVATE_KEY_FAKE_ACCOUNT}/g" chain/.env
RUN sed -i "s/PRIVATE_KEY_POET_TEST=UPDATE_ME/PRIVATE_KEY_POET_TEST=${PRIVATE_KEY_POET_TEST}/g" chain/.env
RUN sed -i "s/ETHERSCAN_OPTIMISM_API_KEY=UPDATE_ME/ETHERSCAN_OPTIMISM_API_KEY=${ETHERSCAN_OPTIMISM_API_KEY}/g" chain/.env
RUN sed -i "s/ETHERSCAN_ETHEREUM_API_KEY=UPDATE_ME/ETHERSCAN_ETHEREUM_API_KEY=${ETHERSCAN_ETHEREUM_API_KEY}/g" chain/.env

# Install dependencies and setup
RUN yarn install && yarn setup

# Specify the command to run on container start
CMD ["yarn", "start"]

