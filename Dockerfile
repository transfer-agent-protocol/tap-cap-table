# Use the official node image as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# COPY ./chain/out ./chain/out
COPY . .

# Install dependencies and setup
RUN yarn install

# Specify the command to run on container start
CMD ["yarn", "start"]
