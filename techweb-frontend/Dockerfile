FROM node:18-alpine AS dev

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm prune \
	&& npm install \
	&& npm dedupe \
	&& npm audit fix

COPY . .
EXPOSE 3000

CMD ["npm", "run", "dev"]
