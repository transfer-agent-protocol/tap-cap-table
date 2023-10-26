# Use the official node image as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# Install curl and git
RUN apt-get update && apt-get install -y git

# Install foundry
# RUN curl -L https://foundry.paradigm.xyz | bash

# Update the PATH to include the foundryup binary
# ENV PATH="/root/.foundry/bin:${PATH}"

# Clone the git repository
# RUN git clone --recurse-submodules --depth 1 https://github.com/poet-network/tap-cap-table.git .
# Navigate to the submodule directory and checkout the specific commit
# WORKDIR /app/ocf
# RUN git checkout 91ad013d

# Navigate back to the main app directory
WORKDIR /app
# COPY ./chain/out ./chain/out
COPY . .

# Copy .env.example to .env inside of the chain folder
# RUN cd chain && cp .env.example .env && cd ..

# RUN echo "PORT=${PORT}" >> .env
# RUN echo "DATABASE_URL=${DATABASE_URL}" >> .env
# RUN echo "ETHERSCAN_OPTIMISM_API_KEY=${ETHERSCAN_OPTIMISM_API_KEY}" >> .env
# RUN echo "ETHERSCAN_ETHEREUM_API_KEY=${ETHERSCAN_ETHEREUM_API_KEY}" >> .env
# RUN echo "PRIVATE_KEY_POET_TEST=${PRIVATE_KEY_POET_TEST}" >> .env
# RUN echo "OPTIMISM_GOERLI_RPC_URL=${OPTIMISM_GOERLI_RPC_URL}" >> .env
# RUN echo "CHAIN=${CHAIN}" >> .env

# RUN sed -i "s/OPTIMISM_GOERLI_RPC_URL=UPDATE_ME/OPTIMISM_GOERLI_RPC_URL=${OPTIMISM_GOERLI_RPC_URL}/g" chain/.env
# RUN sed -i "s/PRIVATE_KEY_FAKE_ACCOUNT=UPDATE_ME/PRIVATE_KEY_FAKE_ACCOUNT=${PRIVATE_KEY_FAKE_ACCOUNT}/g" chain/.env
# RUN sed -i "s/PRIVATE_KEY_POET_TEST=UPDATE_ME/PRIVATE_KEY_POET_TEST=${PRIVATE_KEY_POET_TEST}/g" chain/.env
# RUN sed -i "s/ETHERSCAN_OPTIMISM_API_KEY=UPDATE_ME/ETHERSCAN_OPTIMISM_API_KEY=${ETHERSCAN_OPTIMISM_API_KEY}/g" chain/.env
# RUN sed -i "s/ETHERSCAN_ETHEREUM_API_KEY=UPDATE_ME/ETHERSCAN_ETHEREUM_API_KEY=${ETHERSCAN_ETHEREUM_API_KEY}/g" chain/.env

# Install dependencies and setup
RUN yarn install # && yarn setup

# Specify the command to run on container start
CMD ["yarn", "start"]
