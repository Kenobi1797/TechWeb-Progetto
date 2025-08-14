FROM node:18-alpine AS base

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm prune \
	&& npm install \
	&& npm dedupe \
	&& npm audit fix

COPY . .
EXPOSE 5000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]
