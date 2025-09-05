FROM node:22 AS dev

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
EXPOSE 3000

CMD ["npm", "run", "dev"]
