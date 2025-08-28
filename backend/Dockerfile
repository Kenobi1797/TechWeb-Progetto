FROM node:18-alpine AS base

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm prune \
	&& npm install \
	&& npm dedupe \
	&& npm audit fix

COPY . .
EXPOSE 5000

# Configurazione ottimizzata per ridurre riavvii in sviluppo
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "--ignore-watch", "node_modules", "--poll", "src/server.ts"]
