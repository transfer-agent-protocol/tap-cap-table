# Use the official node image as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# Install curl and git
RUN apt-get update && apt-get install -y curl git

# Install foundry
RUN curl -L https://foundry.paradigm.xyz | bash

# Update the PATH to include the foundryup binary
ENV PATH="/root/.foundry/bin:${PATH}"

# Install yarn
# RUN npm install -g yarn

# Clone the git repository
RUN git clone --recurse-submodules https://github.com/poet-network/tap-cap-table.git .

# Copy .env.example to .env in the root of the project
RUN cp .env.example .env

# Copy .env.example to .env inside of the chain folder
RUN cd chain && cp .env.example .env && cd ..

# Install dependencies and setup
RUN yarn install && yarn setup

# Specify the command to run on container start
CMD ["yarn", "start"]

