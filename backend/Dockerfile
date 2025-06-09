FROM node:18-alpine AS dev

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]
