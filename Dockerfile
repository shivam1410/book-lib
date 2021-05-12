# Base os taken alpine to reduce the size
FROM node:14.16.1-alpine3.13

# Create app directory
WORKDIR /

ENV PORT=10000
# Install app dependencies
COPY package.json package.json

RUN npm install

# Bundle app source
COPY . .

CMD [ "node", "server.js" ]
EXPOSE 10000
