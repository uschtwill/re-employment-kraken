FROM node:20.9.0-alpine3.18

WORKDIR /usr/src/app

# Install dependencies.
COPY package*.json ./
RUN npm install

# Copy required source code. Do not include config and database files. Those should be mounted as volumes.
COPY lib/ ./lib/
COPY *.js ./

CMD ["npm", "start"]
